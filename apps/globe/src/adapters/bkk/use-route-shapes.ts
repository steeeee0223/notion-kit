import { useQuery } from "@tanstack/react-query";

export interface RouteShape {
  shapeId: string;
  routeId: string;
  points: [number, number][];
}

const API_BASE = "http://localhost:3100";

export function useRouteShapes(routeId: string | null) {
  return useQuery<RouteShape[]>({
    queryKey: ["transit", "shapes", routeId],
    queryFn: async () => {
      if (!routeId) return [];
      const res = await fetch(`${API_BASE}/api/transit/shapes/${routeId}`);
      if (!res.ok) return [];
      return (await res.json()) as RouteShape[];
    },
    enabled: !!routeId,
    staleTime: 5 * 60 * 1000,
  });
}
