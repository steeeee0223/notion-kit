import { create } from "zustand";

import type { SelectedTripContext } from "@/adapters";
import type {
  StaticFeedSelection,
  TransitRoute,
} from "@/adapters/transitland/use-static-feeds";

interface RouteStore {
  mapRouteContext: SelectedTripContext | null;
  selectedRouteContext: SelectedTripContext | null;
  expandedTripId: string | null;
  selectedFeed: StaticFeedSelection | null;
  recentRoutes: TransitRoute[];
  setMapRouteContext: (context: SelectedTripContext | null) => void;
  setSelectedRouteContext: (context: SelectedTripContext | null) => void;
  setExpandedTripId: (tripId: string | null) => void;
  setSelectedFeed: (feed: StaticFeedSelection | null) => void;
  pushRecentRoute: (route: TransitRoute) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  mapRouteContext: null,
  selectedRouteContext: null,
  expandedTripId: null,
  selectedFeed: null,
  recentRoutes: [],
  setMapRouteContext: (context) => set({ mapRouteContext: context }),
  setSelectedRouteContext: (context) =>
    set({ selectedRouteContext: context, expandedTripId: null }),
  setExpandedTripId: (tripId) => set({ expandedTripId: tripId }),
  setSelectedFeed: (feed) => set({ selectedFeed: feed }),
  pushRecentRoute: (route) =>
    set((state) => ({
      recentRoutes: [
        route,
        ...state.recentRoutes.filter((item) => item.id !== route.id),
      ].slice(0, 5),
    })),
}));
