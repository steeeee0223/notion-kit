import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { VehiclePosition } from "@/plugins/transit/use-vehicle-positions";

const WS_URL = "ws://localhost:3100/ws";
const VEHICLE_QUERY_KEY = ["transit", "vehicles"] as const;

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
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let isMounted = true;

    function connect() {
      if (!isMounted) return;

      console.log("[WS] Connecting to", WS_URL);
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log("[WS] Connected");
      };

      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string;
            data: VehiclePosition[];
          };

          if (msg.type === "transit:vehicles") {
            queryClient.setQueryData<VehiclePosition[]>(
              [...VEHICLE_QUERY_KEY],
              (prev) => mergeVehicles(prev, msg.data),
            );
          }
        } catch (err) {
          console.error("[WS] Parse error:", err);
        }
      };

      ws.current.onclose = () => {
        if (!isMounted) return;
        console.log("[WS] Disconnected, reconnecting in 3s...");
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
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [queryClient]);

  return ws;
}
