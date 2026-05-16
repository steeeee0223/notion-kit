import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";

export interface RouteShape {
  shapeId: string;
  routeId: string;
  points: [number, number][];
}

export function useRouteShapes(routeId: string | null) {
  return useQuery<RouteShape[]>({
    queryKey: ["transit", "shapes", routeId],
    queryFn: async () => {
      if (!routeId) return [];
      const { data, error } = await mapApiClient<RouteShape[]>(
        `/bkk/route-shapes/${routeId}`,
      );
      if (error) return [];
      return data;
    },
    enabled: !!routeId,
    staleTime: 5 * 60 * 1000,
  });
}
