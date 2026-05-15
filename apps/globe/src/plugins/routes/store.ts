import { create } from "zustand";

import type { SelectedTripContext } from "@/adapters";
import type {
  StaticFeedSelection,
  TransitRoute,
} from "@/adapters/transitland/use-static-feeds";

interface RouteStore {
  mapRouteContext: SelectedTripContext | null;
  selectedRouteContext: SelectedTripContext | null;
  selectedFeed: StaticFeedSelection | null;
  recentRoutes: TransitRoute[];
  setMapRouteContext: (context: SelectedTripContext | null) => void;
  setSelectedRouteContext: (context: SelectedTripContext | null) => void;
  setSelectedFeed: (feed: StaticFeedSelection | null) => void;
  pushRecentRoute: (route: TransitRoute) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  mapRouteContext: null,
  selectedRouteContext: null,
  selectedFeed: null,
  recentRoutes: [],
  setMapRouteContext: (context) => set({ mapRouteContext: context }),
  setSelectedRouteContext: (context) => set({ selectedRouteContext: context }),
  setSelectedFeed: (feed) => set({ selectedFeed: feed }),
  pushRecentRoute: (route) =>
    set((state) => ({
      recentRoutes: [
        route,
        ...state.recentRoutes.filter((item) => item.id !== route.id),
      ].slice(0, 5),
    })),
}));
