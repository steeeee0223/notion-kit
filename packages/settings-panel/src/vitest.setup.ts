import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {
      return;
    }

    unobserve() {
      return;
    }

    disconnect() {
      return;
    }
  } as unknown as typeof globalThis.ResizeObserver;
}
