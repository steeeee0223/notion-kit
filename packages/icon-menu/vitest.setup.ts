import "@testing-library/jest-dom/vitest";

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
