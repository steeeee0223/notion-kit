import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAdapterBBoxStore, useAdapterStore } from "@/adapters";
import {
  toVehiclePositions,
  type MapServerVehicle,
} from "@/adapters/transitland/transfer";
import type { VehiclePosition } from "@/adapters/transitland/use-vehicle-positions";
import { useVehicleDiagnosticsStore } from "@/adapters/transitland/use-vehicle-positions";
import { MAP_WS_URL } from "@/lib/api-client";
import { useLayerStore } from "@/lib/layer-registry";
import { queryKey } from "@/lib/query-key";

interface WsEnvelope {
  type: string;
  channel?: string;
  payload?: {
    vehicles?: MapServerVehicle[];
    meta?: {
      message?: string;
      auto_sync?: {
        message?: string;
      };
    };
  };
}

function mergeVehicles(
  prev: VehiclePosition[] | undefined,
  incoming: VehiclePosition[],
): VehiclePosition[] {
  if (!prev || prev.length === 0) return incoming;

  const prevMap = new Map<string, VehiclePosition>();
  for (const v of prev) {
    prevMap.set(v.id, v);
  }

  let changed = prev.length !== incoming.length;

  const result: VehiclePosition[] = [];
  for (const next of incoming) {
    const existing = prevMap.get(next.id);

    if (
      existing &&
      existing.longitude === next.longitude &&
      existing.latitude === next.latitude &&
      existing.bearing === next.bearing &&
      existing.stale === next.stale &&
      existing.lastUpdateTime === next.lastUpdateTime
    ) {
      result.push(existing);
    } else {
      result.push(next);
      changed = true;
    }
  }

  return changed ? result : prev;
}

export function useWs() {
  const queryClient = useQueryClient();
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);
  const bbox = useAdapterBBoxStore((state) => state.bbox);
  const zoom = useAdapterBBoxStore((state) => state.zoom);
  const vehiclesEnabled = useLayerStore(
    (state) => state.plugins.get("vehicles")?.enabled ?? false,
  );
  const ws = useRef<WebSocket | null>(null);
  const bboxRef = useRef(bbox);
  const enabled =
    vehiclesEnabled && activeAdapter === "transitland" && !!bbox && zoom >= 8;

  useEffect(() => {
    bboxRef.current = bbox;
  }, [bbox]);

  useEffect(() => {
    if (!enabled) {
      ws.current?.close();
      ws.current = null;
      return;
    }

    let reconnectTimer: ReturnType<typeof setTimeout>;
    let isMounted = true;

    function sendVehicleSubscription(type: "subscribe" | "update") {
      const bbox = parseBbox(bboxRef.current);
      if (!bbox || ws.current?.readyState !== WebSocket.OPEN) return;
      ws.current.send(
        JSON.stringify({
          type,
          channel: "vehicles",
          id: `vehicles-${Date.now()}`,
          payload: { bbox },
        }),
      );
    }

    function connect() {
      if (!isMounted) return;

      ws.current = new WebSocket(MAP_WS_URL);

      ws.current.onopen = () => {
        sendVehicleSubscription("subscribe");
      };

      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as WsEnvelope;

          if (
            msg.type === "data" &&
            msg.channel === "vehicles" &&
            Array.isArray(msg.payload?.vehicles)
          ) {
            useVehicleDiagnosticsStore
              .getState()
              .setMessage(msg.payload.meta?.message ?? null);
            useVehicleDiagnosticsStore
              .getState()
              .setAutoSyncMessage(msg.payload.meta?.auto_sync?.message ?? null);
            const vehicles = toVehiclePositions(msg.payload.vehicles);
            queryClient.setQueryData<VehiclePosition[]>(
              queryKey.mapServer.vehicles(bboxRef.current),
              (prev) => mergeVehicles(prev, vehicles),
            );
          }
        } catch (err) {
          console.error("[WS] Parse error:", err);
        }
      };

      ws.current.onclose = () => {
        if (!isMounted) return;
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.current.onerror = (err) => {
        console.error("[WS] Error", err);
      };
    }

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      ws.current?.close();
      ws.current = null;
    };
  }, [enabled, queryClient]);

  useEffect(() => {
    if (!enabled || ws.current?.readyState !== WebSocket.OPEN) return;
    const bbox = parseBbox(bboxRef.current);
    if (!bbox) return;
    ws.current.send(
      JSON.stringify({
        type: "update",
        channel: "vehicles",
        id: `vehicles-${Date.now()}`,
        payload: { bbox },
      }),
    );
  }, [bbox, enabled]);

  return ws;
}

function parseBbox(value: string) {
  const parts = value.split(",").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }
  return parts as [number, number, number, number];
}
