import { useQuery } from "@tanstack/react-query";

import { queryKey } from "@/lib/query-key";

export interface RouteShape {
  shapeId: string;
  routeId: string;
  points: [number, number][];
}

export function useRouteShapes(routeId: string | null) {
  return useQuery<RouteShape[]>({
    queryKey: queryKey.bkk.routeShapes(routeId),
    queryFn: () => [],
    enabled: !!routeId,
    staleTime: 5 * 60 * 1000,
  });
}
