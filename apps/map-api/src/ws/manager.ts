import type { WebSocket } from "@fastify/websocket";

import type { VehiclePosition } from "@/providers/types.js";

type WsMessage =
  | { type: "transit:vehicles"; data: VehiclePosition[] }
  | {
      type: "transit:stats";
      data: { count: number; byType: Record<string, number> };
    };

class WebSocketManager {
  private clients = new Set<WebSocket>();

  addClient(ws: WebSocket) {
    this.clients.add(ws);
    ws.on("close", () => {
      this.clients.delete(ws);
    });
  }

  broadcast(message: WsMessage) {
    const payload = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === 1) {
        // OPEN
        client.send(payload);
      }
    }
  }

  get connectedCount() {
    return this.clients.size;
  }
}

export const wsManager = new WebSocketManager();
