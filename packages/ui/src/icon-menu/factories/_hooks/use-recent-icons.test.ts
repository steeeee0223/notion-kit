import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useRecentIcons } from "./use-recent-icons";

beforeEach(() => {
  localStorage.clear();
});

describe("useRecentIcons — recency strategy", () => {
  const opts = {
    storageKey: "test:recency",
    maxLimit: 3,
    strategy: "recency" as const,
  };

  it("starts with empty recentIds", () => {
    const { result } = renderHook(() => useRecentIcons(opts));
    expect(result.current.recentIds).toEqual([]);
  });

  it("tracks icons in MRU order", () => {
    const { result } = renderHook(() => useRecentIcons(opts));

    act(() => result.current.trackRecent("a"));
    act(() => result.current.trackRecent("b"));
    act(() => result.current.trackRecent("c"));

    expect(result.current.recentIds).toEqual(["c", "b", "a"]);
  });

  it("deduplicates and moves to front on re-select", () => {
    const { result } = renderHook(() => useRecentIcons(opts));

    act(() => result.current.trackRecent("a"));
    act(() => result.current.trackRecent("b"));
    act(() => result.current.trackRecent("a")); // move 'a' to front

    expect(result.current.recentIds).toEqual(["a", "b"]);
  });

  it("respects maxLimit", () => {
    const { result } = renderHook(() => useRecentIcons(opts));

    act(() => result.current.trackRecent("a"));
    act(() => result.current.trackRecent("b"));
    act(() => result.current.trackRecent("c"));
    act(() => result.current.trackRecent("d")); // exceeds limit of 3

    expect(result.current.recentIds).toHaveLength(3);
    expect(result.current.recentIds).toEqual(["d", "c", "b"]);
  });
});

describe("useRecentIcons — frequency strategy", () => {
  const opts = {
    storageKey: "test:frequency",
    maxLimit: 3,
    strategy: "frequency" as const,
  };

  it("starts with empty recentIds", () => {
    const { result } = renderHook(() => useRecentIcons(opts));
    expect(result.current.recentIds).toEqual([]);
  });

  it("sorts by usage count descending", () => {
    const { result } = renderHook(() => useRecentIcons(opts));

    act(() => result.current.trackRecent("a"));
    act(() => result.current.trackRecent("b"));
    act(() => result.current.trackRecent("b")); // b = 2
    act(() => result.current.trackRecent("c"));
    act(() => result.current.trackRecent("c"));
    act(() => result.current.trackRecent("c")); // c = 3

    expect(result.current.recentIds[0]).toBe("c"); // most used
    expect(result.current.recentIds[1]).toBe("b");
    expect(result.current.recentIds[2]).toBe("a"); // least used
  });

  it("respects maxLimit", () => {
    const { result } = renderHook(() => useRecentIcons(opts));

    act(() => result.current.trackRecent("a"));
    act(() => result.current.trackRecent("b"));
    act(() => result.current.trackRecent("c"));
    act(() => result.current.trackRecent("d")); // 4th unique icon

    expect(result.current.recentIds).toHaveLength(3);
  });

  it("increments count on repeated selection", () => {
    const { result } = renderHook(() => useRecentIcons(opts));

    act(() => result.current.trackRecent("x"));
    act(() => result.current.trackRecent("x"));
    act(() => result.current.trackRecent("x"));

    expect(result.current.recentIds).toEqual(["x"]);
  });
});

describe("useRecentIcons — defaults", () => {
  it("defaults to recency strategy with maxLimit 20", () => {
    const { result } = renderHook(() =>
      useRecentIcons({ storageKey: "test:defaults" }),
    );

    // Track 5 items
    for (let i = 0; i < 5; i++) {
      act(() => result.current.trackRecent(`icon-${i}`));
    }

    // Should be in reverse order (MRU)
    expect(result.current.recentIds[0]).toBe("icon-4");
    expect(result.current.recentIds).toHaveLength(5);
  });
});
