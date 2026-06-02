import { describe, expect, it } from "vitest";

import {
  composeRefs,
  getPositionAfterLayoutOffsetChange,
  getPositionAfterVisualPositionPreserved,
  getPositioningReferenceOrigin,
  useComposedRefs,
} from "./sling-shot-utils";

describe("sling-shot utils", () => {
  it("composeRefs returns callback ref cleanups from composed refs", () => {
    let cleanupCalled = false;
    const node = {};

    const composedRef = composeRefs(() => {
      return () => {
        cleanupCalled = true;
      };
    });

    const cleanup = composedRef(node);

    expect(cleanup).toBeTypeOf("function");
    cleanup?.();
    expect(cleanupCalled).toBe(true);
  });

  it("exports a hook for stable composed ref identity", () => {
    expect(useComposedRefs).toBeTypeOf("function");
  });

  it("layout offset changes do not move undisplaced items", () => {
    const nextPosition = getPositionAfterLayoutOffsetChange({
      currentPosition: { x: 0, y: 0 },
      nextLayoutOffset: { x: 24, y: 24 },
      previousLayoutOffset: { x: 401, y: 311 },
    });

    expect(nextPosition).toEqual({ x: 0, y: 0 });
  });

  it("layout offset changes preserve displaced items visually", () => {
    const nextPosition = getPositionAfterLayoutOffsetChange({
      currentPosition: { x: 120, y: 80 },
      nextLayoutOffset: { x: 24, y: 24 },
      previousLayoutOffset: { x: 320, y: 180 },
    });

    expect(nextPosition).toEqual({ x: 416, y: 236 });
  });

  it("positioning origin falls back to bounds when root has no box", () => {
    const origin = getPositioningReferenceOrigin({
      boundsRect: { height: 600, left: 48, top: 96, width: 800 },
      rootRect: { height: 0, left: 0, top: 0, width: 0 },
    });

    expect(origin).toEqual({ x: 48, y: 96 });
  });

  it("preserved visual position is converted into next layout space", () => {
    const nextPosition = getPositionAfterVisualPositionPreserved({
      nextLayoutOffset: { x: 120, y: 240 },
      visualPosition: { x: 180, y: 520 },
    });

    expect(nextPosition).toEqual({ x: 60, y: 280 });
  });
});
