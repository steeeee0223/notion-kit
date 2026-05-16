import type { FastifyBaseLogger } from "fastify";

import type { MapServerEnv } from "@/env";
import {
  currentGtfsTime,
  secondsToGtfsTime,
  todayServiceDate,
  withinBbox,
  type Bbox,
} from "@/lib/schemas";
import { buildStopDepartures } from "@/services/departures";
import {
  getLatestVehicleSnapshots,
  getReplayVehicleRows,
  getRoutesByIds,
} from "@/services/repository";
import { toVehicleResponse } from "@/services/transfer";

interface WebSocketLike {
  readyState: number;
  send: (data: string) => void;
  close: () => void;
  on: (event: "message", handler: (message: Buffer | string) => void) => void;
  once: (event: "close", handler: () => void) => void;
}

interface Envelope {
  type: string;
  channel?: string;
  id?: string;
  payload?: Record<string, unknown>;
}

interface VehicleSubscription {
  bbox?: Bbox;
  feedOnestopIds?: string[];
  routeType?: number;
}

interface StopDeparturesSubscription {
  stopId: string;
  windowMinutes: number;
}

interface ReplaySession {
  start: string;
  end: string;
  speed: number;
  bbox?: Bbox;
  feedOnestopIds?: string[];
  paused: boolean;
  cursor: number;
  timer?: ReturnType<typeof setTimeout>;
  frames: {
    timestamp: string;
    vehicles: ReturnType<typeof toVehicleResponse>[];
  }[];
}

interface ClientState {
  socket: WebSocketLike;
  vehicles?: VehicleSubscription;
  stopDepartures?: StopDeparturesSubscription;
  replay?: ReplaySession;
}

export class WsHub {
  private readonly clients = new Map<WebSocketLike, ClientState>();

  constructor(
    private readonly env: MapServerEnv,
    private readonly logger: FastifyBaseLogger,
  ) {}

  add(socket: WebSocketLike) {
    const state: ClientState = { socket };
    this.clients.set(socket, state);

    socket.on("message", (message) => {
      this.handleMessage(state, message).catch((error: unknown) => {
        this.logger.error(error, "WebSocket message failed");
        this.send(socket, {
          type: "error",
          payload: {
            message: error instanceof Error ? error.message : String(error),
          },
        });
      });
    });
    socket.once("close", () => {
      this.cleanup(state);
      this.clients.delete(socket);
    });
  }

  async broadcastVehicles() {
    const subscribed = [...this.clients.values()].filter(
      (client) => client.vehicles,
    );
    if (subscribed.length === 0) return;
    const vehicles = await getLatestVehicleSnapshots({});
    const routes = await getRoutesByIds(
      vehicles.flatMap((vehicle) => (vehicle.routeId ? [vehicle.routeId] : [])),
    );
    for (const client of subscribed) {
      const subscription = client.vehicles;
      if (!subscription) continue;
      const filtered = vehicles.filter((vehicle) => {
        const route = vehicle.routeId ? routes.get(vehicle.routeId) : undefined;
        const feedMatches =
          !subscription.feedOnestopIds?.length ||
          subscription.feedOnestopIds.includes(vehicle.feedOnestopId);
        const routeTypeMatches =
          typeof subscription.routeType !== "number" ||
          route?.routeType === subscription.routeType;
        return (
          feedMatches &&
          routeTypeMatches &&
          withinBbox({ lat: vehicle.lat, lon: vehicle.lon }, subscription.bbox)
        );
      });
      this.send(client.socket, {
        type: "data",
        channel: "vehicles",
        payload: {
          timestamp: new Date().toISOString(),
          vehicles: filtered.map((vehicle) =>
            toVehicleResponse(
              vehicle,
              vehicle.routeId ? routes.get(vehicle.routeId) : undefined,
            ),
          ),
          alerts: [],
        },
      });
    }
  }

  private async handleMessage(state: ClientState, rawMessage: Buffer | string) {
    const message = parseEnvelope(rawMessage);
    if (message.type === "ping") {
      this.send(state.socket, { type: "pong", id: message.id });
      return;
    }

    if (message.type === "unsubscribe") {
      this.unsubscribe(state, message.channel);
      return;
    }

    if (message.channel === "vehicles") {
      await this.handleVehiclesMessage(state, message);
      return;
    }

    if (message.channel === "stop:departures") {
      await this.handleStopDeparturesMessage(state, message);
      return;
    }

    if (message.channel === "replay") {
      await this.handleReplayMessage(state, message);
      return;
    }

    this.send(state.socket, {
      type: "error",
      channel: message.channel,
      id: message.id,
      payload: { message: "Unsupported WebSocket channel" },
    });
  }

  private async handleVehiclesMessage(state: ClientState, message: Envelope) {
    if (message.type !== "subscribe" && message.type !== "update") return;
    state.vehicles = {
      bbox: parseBboxPayload(message.payload?.bbox),
      feedOnestopIds: parseStringArray(message.payload?.feed_onestop_ids),
      routeType: parseNumber(message.payload?.route_type),
    };
    this.send(state.socket, {
      type: message.type === "subscribe" ? "subscribed" : "updated",
      channel: "vehicles",
      id: message.id,
      payload: { interval_seconds: 15, snapshot_age_seconds: 0 },
    });
    await this.broadcastVehicles();
  }

  private async handleStopDeparturesMessage(
    state: ClientState,
    message: Envelope,
  ) {
    if (message.type !== "subscribe" && message.type !== "update") return;
    const stopId = stringValue(message.payload?.stop_id);
    if (!stopId) {
      this.send(state.socket, {
        type: "error",
        channel: "stop:departures",
        id: message.id,
        payload: { message: "stop_id is required" },
      });
      return;
    }
    state.stopDepartures = {
      stopId,
      windowMinutes: parseNumber(message.payload?.window_minutes) ?? 60,
    };
    this.send(state.socket, {
      type: message.type === "subscribe" ? "subscribed" : "updated",
      channel: "stop:departures",
      id: message.id,
      payload: { stop_id: stopId },
    });
    await this.sendStopDepartures(state);
  }

  private async handleReplayMessage(state: ClientState, message: Envelope) {
    if (message.type === "pause" && state.replay) {
      state.replay.paused = true;
      clearReplayTimer(state.replay);
      return;
    }
    if (message.type === "resume" && state.replay) {
      state.replay.paused = false;
      this.scheduleReplayFrame(state);
      return;
    }
    if (message.type === "set_speed" && state.replay) {
      state.replay.speed =
        parseNumber(message.payload?.speed) ?? state.replay.speed;
      this.scheduleReplayFrame(state);
      return;
    }
    if (message.type === "seek" && state.replay) {
      const timestamp = stringValue(message.payload?.timestamp);
      if (timestamp) {
        state.replay.cursor = Math.max(
          0,
          state.replay.frames.findIndex(
            (frame) => frame.timestamp >= timestamp,
          ),
        );
        this.sendReplayFrame(state);
      }
      return;
    }
    if (message.type !== "subscribe") return;

    const start = stringValue(message.payload?.start);
    const end = stringValue(message.payload?.end);
    if (!start || !end) {
      this.send(state.socket, {
        type: "error",
        channel: "replay",
        id: message.id,
        payload: { message: "start and end are required" },
      });
      return;
    }
    const frameSeconds = this.env.MAP_REPLAY_FRAME_SECONDS;
    const frames = await this.buildReplayFrames({
      start,
      end,
      bbox: parseBboxPayload(message.payload?.bbox),
      feedOnestopIds: parseStringArray(message.payload?.feed_onestop_ids),
    });
    state.replay = {
      start,
      end,
      speed: parseNumber(message.payload?.speed) ?? 10,
      bbox: parseBboxPayload(message.payload?.bbox),
      feedOnestopIds: parseStringArray(message.payload?.feed_onestop_ids),
      paused: false,
      cursor: 0,
      frames,
    };
    this.send(state.socket, {
      type: "subscribed",
      channel: "replay",
      id: message.id,
      payload: {
        start,
        end,
        speed: state.replay.speed,
        frame_interval_seconds: frameSeconds,
        total_frames: frames.length,
        data_available: frames.length > 0,
      },
    });
    this.sendReplayFrame(state);
  }

  private async sendStopDepartures(state: ClientState) {
    const subscription = state.stopDepartures;
    if (!subscription) return;
    const startTime = currentGtfsTime();
    const data = await buildStopDepartures({
      stopId: subscription.stopId,
      date: todayServiceDate(),
      startTime,
      endTime: secondsToGtfsTime(
        timeToSeconds(startTime) + subscription.windowMinutes * 60,
      ),
      includeRealtime: true,
      includeAlerts: true,
      limit: 30,
    });
    this.send(state.socket, {
      type: "data",
      channel: "stop:departures",
      payload: {
        stop_id: data.stop.id,
        stop_name: data.stop.stop_name,
        timestamp: new Date().toISOString(),
        departures: data.departures,
        alerts: data.alerts,
      },
    });
  }

  private async buildReplayFrames(input: {
    start: string;
    end: string;
    bbox?: Bbox;
    feedOnestopIds?: string[];
  }) {
    const rows = await getReplayVehicleRows({
      start: input.start,
      end: input.end,
      bbox: input.bbox,
      feedOnestopId: input.feedOnestopIds?.[0],
    });
    const routes = await getRoutesByIds(
      rows.flatMap((row) => (row.routeId ? [row.routeId] : [])),
    );
    const frames = new Map<string, typeof rows>();
    for (const row of rows) {
      const ts = binTimestamp(
        row.capturedAt.toISOString(),
        this.env.MAP_REPLAY_FRAME_SECONDS,
      );
      frames.set(ts, [...(frames.get(ts) ?? []), row]);
    }
    return [...frames.entries()].map(([timestamp, frameRows]) => ({
      timestamp,
      vehicles: frameRows.map((vehicle) =>
        toVehicleResponse(
          vehicle,
          vehicle.routeId ? routes.get(vehicle.routeId) : undefined,
        ),
      ),
    }));
  }

  private sendReplayFrame(state: ClientState) {
    const replay = state.replay;
    if (!replay) return;
    const frame = replay.frames[replay.cursor];
    if (!frame) return;
    this.send(state.socket, {
      type: "data",
      channel: "replay",
      payload: {
        sim_timestamp: frame.timestamp,
        frame_index: replay.cursor,
        total_frames: replay.frames.length,
        vehicles: frame.vehicles,
      },
    });
    replay.cursor += 1;
    this.scheduleReplayFrame(state);
  }

  private scheduleReplayFrame(state: ClientState) {
    const replay = state.replay;
    if (!replay || replay.paused) return;
    clearReplayTimer(replay);
    const delayMs = Math.max(
      100,
      (this.env.MAP_REPLAY_FRAME_SECONDS / replay.speed) * 1000,
    );
    replay.timer = setTimeout(() => {
      this.sendReplayFrame(state);
    }, delayMs);
  }

  private unsubscribe(state: ClientState, channel?: string) {
    if (channel === "vehicles") state.vehicles = undefined;
    if (channel === "stop:departures") state.stopDepartures = undefined;
    if (channel === "replay" && state.replay) {
      clearReplayTimer(state.replay);
      state.replay = undefined;
    }
    this.send(state.socket, { type: "unsubscribed", channel });
  }

  private cleanup(state: ClientState) {
    if (state.replay) clearReplayTimer(state.replay);
  }

  private send(socket: WebSocketLike, message: Envelope) {
    if (socket.readyState !== 1) return;
    socket.send(JSON.stringify(message));
  }
}

function parseEnvelope(rawMessage: Buffer | string): Envelope {
  const raw =
    typeof rawMessage === "string" ? rawMessage : rawMessage.toString("utf8");
  const parsed = JSON.parse(raw) as Envelope;
  return {
    type: parsed.type,
    channel: parsed.channel,
    id: parsed.id,
    payload: parsed.payload,
  };
}

function parseBboxPayload(value: unknown) {
  if (!Array.isArray(value) || value.length !== 4) return undefined;
  const numbers = value.map((item) => Number(item));
  if (numbers.some((item) => !Number.isFinite(item))) return undefined;
  return numbers as unknown as Bbox;
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap((item) => (typeof item === "string" ? [item] : []));
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function clearReplayTimer(replay: ReplaySession) {
  if (replay.timer) clearTimeout(replay.timer);
  replay.timer = undefined;
}

function timeToSeconds(value: string) {
  const [hours, minutes, seconds] = value
    .split(":")
    .map((part) => Number(part));
  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
}

function binTimestamp(timestamp: string, stepSeconds: number) {
  const stepMs = stepSeconds * 1000;
  return new Date(
    Math.floor(Date.parse(timestamp) / stepMs) * stepMs,
  ).toISOString();
}
