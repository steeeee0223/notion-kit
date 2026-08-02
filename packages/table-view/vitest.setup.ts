import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

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

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0];

    observe() {
      return;
    }
    unobserve() {
      return;
    }
    disconnect() {
      return;
    }
    takeRecords() {
      return [];
    }
  } as unknown as typeof globalThis.IntersectionObserver;
}

if (typeof Element.prototype.getAnimations === "undefined") {
  Element.prototype.getAnimations = function () {
    return [];
  };
}

if (typeof Document.prototype.getAnimations === "undefined") {
  Document.prototype.getAnimations = function () {
    return [];
  };
}

if (typeof Element.prototype.setPointerCapture === "undefined") {
  Element.prototype.setPointerCapture = function () {
    return;
  };
  Element.prototype.releasePointerCapture = function () {
    return;
  };
  Element.prototype.hasPointerCapture = function () {
    return false;
  };
}

if (typeof Document.prototype.elementFromPoint === "undefined") {
  Document.prototype.elementFromPoint = function () {
    return null;
  };
}

if (typeof Element.prototype.animate === "undefined") {
  Element.prototype.animate = function () {
    return {
      finished: Promise.resolve(),
      cancel() {
        return;
      },
    } as unknown as Animation;
  };
}
