import { useMemo, useSyncExternalStore } from "react";
import isEqual from "lodash.isequal";

import type { MapViewport } from "./map";

export type CurrentLocationStatus =
  "idle" | "loading" | "success" | "error" | "unsupported";

export interface CurrentLocationState {
  coordinates: MapViewport["center"] | null;
  error: GeolocationPositionError | null;
  position: GeolocationPosition | null;
  status: CurrentLocationStatus;
}

const defaultCurrentLocation: CurrentLocationState = {
  coordinates: null,
  error: null,
  position: null,
  status: "idle",
};

function createCurrentLocationStore(options?: PositionOptions) {
  let snapshot = defaultCurrentLocation;
  let watchId: number | null = null;
  const listeners = new Set<() => void>();
  const getGeolocation = () => {
    if (typeof navigator === "undefined") return null;

    const maybeNavigator = navigator as unknown as {
      geolocation?: Geolocation;
    };

    return maybeNavigator.geolocation ?? null;
  };
  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const setSnapshot = (next: CurrentLocationState) => {
    if (isEqual(snapshot, next)) return;

    snapshot = next;
    emit();
  };

  const stopWatching = () => {
    const geolocation = getGeolocation();
    if (watchId === null || !geolocation) return;

    geolocation.clearWatch(watchId);
    watchId = null;
  };

  const startWatching = () => {
    const geolocation = getGeolocation();
    if (!geolocation) {
      setSnapshot({ ...defaultCurrentLocation, status: "unsupported" });
      return;
    }

    if (watchId !== null) return;

    setSnapshot({ ...snapshot, error: null, status: "loading" });
    watchId = geolocation.watchPosition(
      (position) => {
        setSnapshot({
          coordinates: [position.coords.longitude, position.coords.latitude],
          error: null,
          position,
          status: "success",
        });
      },
      (error) => {
        setSnapshot({
          ...snapshot,
          error,
          status: "error",
        });
      },
      options,
    );
  };

  return {
    getServerSnapshot: () => defaultCurrentLocation,
    getSnapshot: () => snapshot,
    subscribe: (onStoreChange: () => void) => {
      listeners.add(onStoreChange);
      startWatching();

      return () => {
        listeners.delete(onStoreChange);

        if (listeners.size === 0) {
          stopWatching();
        }
      };
    },
  };
}

export function useCurrentLocation(options?: PositionOptions) {
  const store = useMemo(() => createCurrentLocationStore(options), [options]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}
