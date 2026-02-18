import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  useNotionIconsFactory,
  type UseNotionIconsFactoryOptions,
} from "./use-notion-icons-factory";

async function waitForIcons(options?: UseNotionIconsFactoryOptions) {
  const { result } = renderHook(() => useNotionIconsFactory(options));

  await waitFor(() => {
    expect(
      result.current.sections.find((s) => s.id === "all")?.iconIds.length,
    ).toBeGreaterThan(0);
  });
  return result;
}

describe("useNotionIconsFactory", () => {
  it("should return a valid factory result", () => {
    const { result } = renderHook(() => useNotionIconsFactory());
    const factory = result.current;

    expect(factory.id).toBe("notion");
    expect(factory.label).toBe("Notion");
    expect(factory.onSelect).toBeTypeOf("function");
  });

  it("should have an 'all' section labeled 'Notion Icons'", () => {
    const { result } = renderHook(() => useNotionIconsFactory());

    expect(result.current.sections.find((s) => s.id === "all")).toBeDefined();

    const allSection = result.current.sections.find((s) => s.id === "all");
    expect(allSection?.label).toBe("Notion Icons");
  });

  it("getItem returns IconItem with name and keywords", async () => {
    const result = await waitForIcons();

    const firstId = result.current.sections.find((s) => s.id === "all")!
      .iconIds[0]!;
    const item = result.current.getItem(firstId);

    expect(item.id).toBe(firstId);
    expect(typeof item.name).toBe("string");
    expect(Array.isArray(item.keywords)).toBe(true);
  });

  it("getItem returns fallback for unknown id", async () => {
    const result = await waitForIcons();
    const item = result.current.getItem("nonexistent-icon");

    expect(item.id).toBe("nonexistent-icon");
    expect(item.keywords).toEqual([]);
  });

  it("search returns matching icons by name or tags", async () => {
    const result = await waitForIcons();

    const results = result.current.search("star");
    expect(results.length).toBeGreaterThan(0);
  });

  it("search returns empty for empty query", () => {
    const { result } = renderHook(() => useNotionIconsFactory());
    expect(result.current.search("")).toEqual([]);
  });

  it("search respects maxSearchResults", async () => {
    const result = await waitForIcons({ maxSearchResults: 3 });

    const results = result.current.search("a");
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("toIconData returns url type with color in the path", async () => {
    const result = await waitForIcons();

    const firstId = result.current.sections.find((s) => s.id === "all")!
      .iconIds[0]!;
    const item = result.current.getItem(firstId);
    const data = result.current.toIconData(item, {});

    expect(data.type).toBe("url");
    expect(data.src).toContain("notion.so/icons/");
    expect(data.src).toContain("gray"); // default color
  });

  it("toolbar is defined (ColorPicker)", () => {
    const { result } = renderHook(() => useNotionIconsFactory());
    expect(result.current.toolbar).toBeDefined();
  });

  it("getRandomIcon returns a valid item after loading", async () => {
    const result = await waitForIcons();

    const item = result.current.getRandomIcon!();
    expect(item.id).toBeDefined();
    expect(item.id.length).toBeGreaterThan(0);
  });

  it("getRandomIcon returns empty item when no icons loaded", () => {
    const { result } = renderHook(() => useNotionIconsFactory());
    // Before icons are loaded
    const item = result.current.getRandomIcon!();
    expect(item.id).toBe("");
  });

  it("tracks recent icons via onSelect", async () => {
    localStorage.clear();
    const result = await waitForIcons();

    const firstId = result.current.sections.find((s) => s.id === "all")!
      .iconIds[0]!;
    const item = result.current.getItem(firstId);

    act(() => {
      result.current.onSelect?.(item);
    });

    const recentSection = result.current.sections.find(
      (s) => s.id === "recent",
    );
    expect(recentSection).toBeDefined();
    expect(recentSection!.iconIds).toContain(firstId);
  });
});
