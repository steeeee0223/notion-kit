import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useUploadFactory } from "./use-upload-factory";

beforeEach(() => {
  localStorage.clear();
});

describe("useUploadFactory", () => {
  it("should return a valid factory result", () => {
    const { result } = renderHook(() => useUploadFactory());
    const factory = result.current;

    expect(factory.id).toBe("upload");
    expect(factory.label).toBe("Uploads");
    expect(factory.onSelect).toBeTypeOf("function");
  });

  it("is hidden when no icons are stored", () => {
    const { result } = renderHook(() => useUploadFactory());
    expect(result.current.hidden).toBe(true);
  });

  it("onSelect stores a new icon and sets hidden to false", () => {
    const { result } = renderHook(() => useUploadFactory());

    act(() => {
      result.current.onSelect?.({
        id: "https://example.com/icon.png",
        name: "icon",
        keywords: [],
      });
    });
    expect(result.current.hidden).toBe(false);

    const stored = JSON.parse(
      localStorage.getItem("icon-menu:upload") ?? "[]",
    ) as unknown[];
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://example.com/icon.png" }),
      ]),
    );
  });

  it("onSelect deduplicates icons with the same id", () => {
    const { result } = renderHook(() => useUploadFactory());
    const item = {
      id: "https://example.com/icon.png",
      name: "icon",
      keywords: [],
    };

    act(() => {
      result.current.onSelect?.(item);
      result.current.onSelect?.(item);
    });
    expect(result.current.hidden).toBe(false);

    const stored = JSON.parse(
      localStorage.getItem("icon-menu:upload") ?? "[]",
    ) as unknown[];
    expect(stored).toHaveLength(1);
  });

  it("stored icons appear in the 'all' section", () => {
    const { result } = renderHook(() => useUploadFactory());

    act(() => {
      result.current.onSelect?.({
        id: "https://example.com/a.png",
        name: "a",
        keywords: [],
      });
    });

    const allSection = result.current.sections.find((s) => s.id === "all");
    expect(allSection?.iconIds).toContain("https://example.com/a.png");
  });

  it("getItem returns the stored icon data", () => {
    const { result } = renderHook(() => useUploadFactory());

    act(() => {
      result.current.onSelect?.({
        id: "https://example.com/test.png",
        name: "test",
        keywords: [],
      });
    });
    expect(result.current.hidden).toBe(false);

    const item = result.current.getItem("https://example.com/test.png");
    expect(item.id).toBe("https://example.com/test.png");
  });

  it("toIconData returns url type", () => {
    const { result } = renderHook(() => useUploadFactory());

    act(() => {
      result.current.onSelect?.({
        id: "https://example.com/test.png",
        name: "test",
        keywords: [],
      });
    });
    expect(result.current.hidden).toBe(false);

    const item = result.current.getItem("https://example.com/test.png");
    const data = result.current.toIconData(item, {});

    expect(data.type).toBe("url");
    expect(data.src).toBe("https://example.com/test.png");
  });

  it("search finds stored icons by URL", () => {
    const { result } = renderHook(() => useUploadFactory());

    act(() => {
      result.current.onSelect?.({
        id: "https://example.com/star-icon.png",
        name: "star-icon",
        keywords: [],
      });
    });
    expect(result.current.hidden).toBe(false);

    const results = result.current.search("star");
    expect(results).toContain("https://example.com/star-icon.png");
  });

  it("evicts oldest icons when maxStored is exceeded", () => {
    const { result } = renderHook(() => useUploadFactory({ maxStored: 2 }));

    act(() => {
      result.current.onSelect?.({
        id: "first",
        name: "first",
        keywords: [],
      });
    });
    expect(result.current.hidden).toBe(false);

    act(() => {
      result.current.onSelect?.({
        id: "second",
        name: "second",
        keywords: [],
      });
    });

    act(() => {
      result.current.onSelect?.({
        id: "third",
        name: "third",
        keywords: [],
      });
    });
    expect(result.current.hidden).toBe(false);

    const stored = JSON.parse(
      localStorage.getItem("icon-menu:upload") ?? "[]",
    ) as unknown[];
    expect(stored).toHaveLength(2);
  });

  it("accepts custom id and label", () => {
    const { result } = renderHook(() =>
      useUploadFactory({ id: "my-uploads", label: "My Icons" }),
    );

    expect(result.current.id).toBe("my-uploads");
    expect(result.current.label).toBe("My Icons");
  });
});
