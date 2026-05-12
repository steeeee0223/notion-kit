import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import isEqual from "lodash.isequal";
import type { Map, MapEventType, Popup, PopupOptions } from "maplibre-gl";

import type { MapViewport } from "./map";
import { useMap } from "./use-map";

export type MapStateEvent = keyof MapEventType;
export type MapStateSelector<T> = (map: Map) => T;
export type PopupOpenStore = Pick<Popup, "isOpen" | "off" | "on">;
export type PopupOptionsStore = Pick<
  Popup,
  "getLngLat" | "setLngLat" | "setMaxWidth" | "setOffset"
> &
  PopupOpenStore;

export interface UseMapStateOptions {
  events?: readonly MapStateEvent[];
}

export interface UsePopupOptionsOptions {
  lngLat?: MapLngLat;
}

export type MapLngLat = MapViewport["center"];

const noop = () => undefined;

export function useMapState<T>(
  selector: MapStateSelector<T>,
  fallback: T,
  { events = [] }: UseMapStateOptions = {},
): T {
  const { map } = useMap();
  const snapshotRef = useRef(fallback);

  const getSnapshot = useCallback(() => {
    if (!map) {
      if (!isEqual(snapshotRef.current, fallback)) {
        snapshotRef.current = fallback;
      }
      return snapshotRef.current;
    }

    const next = selector(map);
    if (isEqual(snapshotRef.current, next)) {
      return snapshotRef.current;
    }

    snapshotRef.current = next;
    return next;
  }, [fallback, map, selector]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!map) return noop;

      for (const event of events) {
        map.on(event, onStoreChange);
      }

      return () => {
        for (const event of events) {
          map.off(event, onStoreChange);
        }
      };
    },
    [events, map],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}

export function useMapBearing() {
  return useMapState((map) => map.getBearing(), 0, { events: ["rotate"] });
}

export function useMapPitch() {
  return useMapState((map) => map.getPitch(), 0, { events: ["pitch"] });
}

export function useMapZoom() {
  return useMapState((map) => map.getZoom(), 0, { events: ["zoom"] });
}

const defaultMapCenter = [0, 0] satisfies MapLngLat;
const selectMapCenter = (map: Map): MapLngLat => {
  const center = map.getCenter();
  return [center.lng, center.lat];
};
export function useMapCenter() {
  return useMapState(selectMapCenter, defaultMapCenter, {
    events: ["move"],
  });
}

const defaultMapViewport = {
  center: [0, 0],
  zoom: 0,
  bearing: 0,
  pitch: 0,
} satisfies MapViewport;
const selectMapViewport = (map: Map): MapViewport => ({
  center: selectMapCenter(map),
  zoom: map.getZoom(),
  bearing: map.getBearing(),
  pitch: map.getPitch(),
});

export function useMapViewport() {
  return useMapState(selectMapViewport, defaultMapViewport, {
    events: ["move"],
  });
}

export function usePopupOpen(popup: PopupOpenStore | null | undefined) {
  const getSnapshot = useCallback(() => popup?.isOpen() ?? false, [popup]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!popup) return noop;

      popup.on("open", onStoreChange);
      popup.on("close", onStoreChange);

      return () => {
        popup.off("open", onStoreChange);
        popup.off("close", onStoreChange);
      };
    },
    [popup],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function usePopupOptions(
  popup: PopupOptionsStore | null | undefined,
  popupOptions: PopupOptions,
  { lngLat }: UsePopupOptionsOptions = {},
) {
  const isOpen = usePopupOpen(popup);
  const offset = popupOptions.offset;
  const maxWidth = popupOptions.maxWidth;
  const prevOptionsRef = useRef<Pick<PopupOptions, "maxWidth" | "offset">>({
    maxWidth: "none",
    offset: 16,
  });
  const longitude = lngLat?.[0];
  const latitude = lngLat?.[1];

  useEffect(() => {
    if (!isOpen || !popup) return;

    const prev = prevOptionsRef.current;

    if (
      typeof longitude === "number" &&
      typeof latitude === "number" &&
      (popup.getLngLat().lng !== longitude || popup.getLngLat().lat !== latitude)
    ) {
      popup.setLngLat([longitude, latitude]);
    }

    if (prev.offset !== offset) {
      popup.setOffset(offset ?? 16);
    }

    if (prev.maxWidth !== maxWidth) {
      popup.setMaxWidth(maxWidth ?? "none");
    }

    prevOptionsRef.current = { offset, maxWidth };
  }, [isOpen, latitude, longitude, maxWidth, offset, popup]);
}
