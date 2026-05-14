import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCurrentLocation } from "../use-current-location";

type GeolocationSuccess = PositionCallback;
type GeolocationFailure = PositionErrorCallback;

const originalGeolocation = navigator.geolocation;

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: originalGeolocation,
  });
});

function createGeolocationPosition(
  longitude: number,
  latitude: number,
): GeolocationPosition {
  return {
    coords: {
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude,
      longitude,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: Date.now(),
    toJSON: () => ({}),
  };
}

function installGeolocation() {
  let successHandler: GeolocationSuccess | null = null;
  let errorHandler: GeolocationFailure | null = null;

  const geolocation = {
    clearWatch: vi.fn(),
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(
      (
        success: GeolocationSuccess,
        error?: GeolocationFailure | null,
        _options?: PositionOptions,
      ) => {
        successHandler = success;
        errorHandler = error ?? null;
        return 1;
      },
    ),
  };

  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: geolocation,
  });

  return {
    emitError: (error: GeolocationPositionError) => {
      errorHandler?.(error);
    },
    emitPosition: (position: GeolocationPosition) => {
      successHandler?.(position);
    },
    geolocation,
  };
}

describe("useCurrentLocation", () => {
  it("subscribes to navigator.geolocation.watchPosition", () => {
    const installed = installGeolocation();
    const options = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 500,
    };
    const { result, unmount } = renderHook(() => useCurrentLocation(options));

    expect(installed.geolocation.watchPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining(options),
    );
    expect(result.current.status).toBe("loading");

    act(() => {
      installed.emitPosition(createGeolocationPosition(121.5654, 25.033));
    });

    expect(result.current).toMatchObject({
      coordinates: [121.5654, 25.033],
      error: null,
      status: "success",
    });

    unmount();

    expect(installed.geolocation.clearWatch).toHaveBeenCalledWith(1);
  });

  it("reports geolocation errors while keeping the latest position", () => {
    const installed = installGeolocation();
    const { result } = renderHook(() => useCurrentLocation());
    const error = {
      code: 1,
      message: "Permission denied",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } satisfies GeolocationPositionError;

    act(() => {
      installed.emitPosition(createGeolocationPosition(10, 20));
    });
    act(() => {
      installed.emitError(error);
    });

    expect(result.current).toMatchObject({
      coordinates: [10, 20],
      error,
      status: "error",
    });
  });

  it("returns unsupported when geolocation is unavailable", () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useCurrentLocation());

    expect(result.current).toEqual({
      coordinates: null,
      error: null,
      position: null,
      status: "unsupported",
    });
  });
});
