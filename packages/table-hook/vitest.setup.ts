import "@testing-library/jest-dom/vitest";

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
