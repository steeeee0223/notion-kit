import { useQuery } from "@tanstack/react-query";

export interface RouteShape {
  shapeId: string;
  routeId: string;
  points: [number, number][];
}

const API_BASE = "http://localhost:3100";

export function useRouteShapes(routeId: string | null) {
  return useQuery<RouteShape[]>({
    queryKey: ["transitland", "shapes", routeId],
    queryFn: async () => {
      if (!routeId) return [];
      const res = await fetch(`${API_BASE}/api/transit/transitland/route-shapes/${routeId}`);
      if (!res.ok) return [];
      const data = await res.json() as { shapes: RouteShape[] };
      return data.shapes;
    },
    enabled: !!routeId,
    staleTime: 5 * 60 * 1000,
  });
}
