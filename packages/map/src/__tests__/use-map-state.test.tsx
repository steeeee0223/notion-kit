import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { describe, expect, it } from "vitest";

import { MapContext } from "../use-map";
import {
  useMapBearing,
  useMapCenter,
  useMapPitch,
  usePopupOpen,
  usePopupOptions,
  type PopupOpenStore,
  type PopupOptionsStore,
} from "../use-map-state";

type Listener = () => void;

class FakeEvented {
  private listeners = new globalThis.Map<string, Set<Listener>>();

  on(type: string, listener: Listener) {
    const listeners = this.listeners.get(type) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);

    return {
      unsubscribe: () => {
        this.off(type, listener);
      },
    };
  }

  off(type: string, listener: Listener) {
    this.listeners.get(type)?.delete(listener);
    return this;
  }

  emit(type: string) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener();
    }
  }

  listenerCount(type: string) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

class FakeMap extends FakeEvented {
  private center = { lng: 0, lat: 0 };
  private bearing = 0;
  private pitch = 0;

  getCenter() {
    return this.center;
  }

  getBearing() {
    return this.bearing;
  }

  getPitch() {
    return this.pitch;
  }

  getZoom() {
    return 0;
  }

  setCenter(lng: number, lat: number) {
    this.center = { lng, lat };
    this.emit("move");
  }

  setBearing(bearing: number) {
    this.bearing = bearing;
    this.emit("rotate");
  }

  setPitch(pitch: number) {
    this.pitch = pitch;
    this.emit("pitch");
  }
}

class FakePopup extends FakeEvented {
  private open = false;
  lngLat = { lng: 0, lat: 0 };
  maxWidth: string | undefined = "none";
  offset: unknown = 16;

  isOpen() {
    return this.open;
  }

  show() {
    this.open = true;
    this.emit("open");
  }

  hide() {
    this.open = false;
    this.emit("close");
  }

  getLngLat() {
    return this.lngLat;
  }

  setLngLat([lng, lat]: [number, number]) {
    this.lngLat = { lng, lat };
    return this;
  }

  setMaxWidth(maxWidth: string) {
    this.maxWidth = maxWidth;
    return this;
  }

  setOffset(offset: unknown) {
    this.offset = offset;
    return this;
  }
}

function createWrapper(map: FakeMap | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MapContext
        value={{ map: map as unknown as MapLibreMap | null, isLoaded: true }}
      >
        {children}
      </MapContext>
    );
  };
}

describe("map state hooks", () => {
  it("updates bearing and pitch from map events", () => {
    const map = new FakeMap();
    const { result } = renderHook(
      () => ({
        bearing: useMapBearing(),
        pitch: useMapPitch(),
      }),
      { wrapper: createWrapper(map) },
    );

    expect(result.current).toEqual({ bearing: 0, pitch: 0 });

    act(() => {
      map.setBearing(45);
    });
    expect(result.current).toEqual({ bearing: 45, pitch: 0 });

    act(() => {
      map.setPitch(30);
    });
    expect(result.current).toEqual({ bearing: 45, pitch: 30 });
  });

  it("keeps an equal center snapshot stable", () => {
    const map = new FakeMap();
    const { result } = renderHook(() => useMapCenter(), {
      wrapper: createWrapper(map),
    });
    const initialCenter = result.current;

    act(() => {
      map.emit("move");
    });
    expect(result.current).toBe(initialCenter);

    act(() => {
      map.setCenter(10, 20);
    });
    expect(result.current).toEqual([10, 20]);
    expect(result.current).not.toBe(initialCenter);
  });
});

describe("usePopupOpen", () => {
  it("tracks popup open and close events", () => {
    const popup = new FakePopup();
    const { result } = renderHook(() =>
      usePopupOpen(popup as unknown as PopupOpenStore),
    );

    expect(result.current).toBe(false);

    act(() => {
      popup.show();
    });
    expect(result.current).toBe(true);

    act(() => {
      popup.hide();
    });
    expect(result.current).toBe(false);
  });

  it("unsubscribes from popup events on unmount", () => {
    const popup = new FakePopup();
    const { unmount } = renderHook(() =>
      usePopupOpen(popup as unknown as PopupOpenStore),
    );

    expect(popup.listenerCount("open")).toBe(1);
    expect(popup.listenerCount("close")).toBe(1);

    unmount();

    expect(popup.listenerCount("open")).toBe(0);
    expect(popup.listenerCount("close")).toBe(0);
  });

  it("falls back to closed when no popup exists", () => {
    const { result } = renderHook(() => usePopupOpen(null));

    expect(result.current).toBe(false);
  });
});

describe("usePopupOptions", () => {
  it("syncs popup options when the popup opens", () => {
    const popup = new FakePopup();
    const { rerender } = renderHook(
      ({ offset, maxWidth, lngLat }) =>
        usePopupOptions(
          popup as unknown as PopupOptionsStore,
          { offset, maxWidth },
          { lngLat },
        ),
      {
        initialProps: {
          lngLat: [10, 20] as [number, number],
          maxWidth: "240px",
          offset: 12,
        },
      },
    );

    rerender({
      lngLat: [30, 40],
      maxWidth: "360px",
      offset: 24,
    });

    expect(popup.lngLat).toEqual({ lng: 0, lat: 0 });
    expect(popup.maxWidth).toBe("none");
    expect(popup.offset).toBe(16);

    act(() => {
      popup.show();
    });

    expect(popup.lngLat).toEqual({ lng: 30, lat: 40 });
    expect(popup.maxWidth).toBe("360px");
    expect(popup.offset).toBe(24);
  });

  it("resets maxWidth to the popup default when it is cleared", () => {
    const popup = new FakePopup();
    const initialProps: { maxWidth?: string } = { maxWidth: "240px" };
    const { rerender } = renderHook(
      ({ maxWidth }: { maxWidth?: string }) =>
        usePopupOptions(popup as unknown as PopupOptionsStore, { maxWidth }),
      { initialProps },
    );

    act(() => {
      popup.show();
    });
    expect(popup.maxWidth).toBe("240px");

    rerender({ maxWidth: undefined });

    expect(popup.maxWidth).toBe("none");
  });
});
