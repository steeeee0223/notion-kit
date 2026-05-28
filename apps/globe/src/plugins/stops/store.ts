import { create } from "zustand";

import type { RouteStop } from "@/adapters";
import type { StaticFeedSelection } from "@/adapters/transitland/use-static-feeds";

interface StopsStore {
  mapStop: RouteStop | null;
  selectedStop: RouteStop | null;
  selectedFeed: StaticFeedSelection | null;
  recentStops: RouteStop[];
  setMapStop: (stop: RouteStop | null) => void;
  setSelectedStop: (stop: RouteStop | null) => void;
  setSelectedFeed: (feed: StaticFeedSelection | null) => void;
  pushRecentStop: (stop: RouteStop) => void;
}

export const useStopsStore = create<StopsStore>((set) => ({
  mapStop: null,
  selectedStop: null,
  selectedFeed: null,
  recentStops: [],
  setMapStop: (stop) => set({ mapStop: stop }),
  setSelectedStop: (stop) => set({ selectedStop: stop }),
  setSelectedFeed: (feed) => set({ selectedFeed: feed }),
  pushRecentStop: (stop) =>
    set((state) => ({
      recentStops: [
        stop,
        ...state.recentStops.filter((item) => item.id !== stop.id),
      ].slice(0, 5),
    })),
}));
