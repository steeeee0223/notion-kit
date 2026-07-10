import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("@better-fetch/fetch", () => ({
  betterFetch: vi.fn(() => Promise.resolve({ data: {}, error: null })),
}));

afterEach(() => {
  cleanup();
});

// jsdom does not have ResizeObserver — needed by TanStack Virtual
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

// jsdom does not implement scrollTo — needed by TanStack Virtual
Element.prototype.scrollTo = function () {
  return;
};

// jsdom does not implement getAnimations — needed by Base UI ScrollArea
if (typeof Element.prototype.getAnimations === "undefined") {
  Element.prototype.getAnimations = function () {
    return [];
  };
}
