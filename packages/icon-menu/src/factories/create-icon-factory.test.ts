import { describe, expect, it } from "vitest";

import { createIconFactory } from "./create-icon-factory";
import type { IconItem, RenderIconOptions, SelectOptions } from "./types";

describe("createIconFactory", () => {
  const mockIcons = [
    { id: "home", name: "Home", keywords: ["house", "building"] },
    { id: "star", name: "Star", keywords: ["favorite", "rating"] },
    { id: "heart", name: "Heart", keywords: ["love", "favorite"] },
    { id: "moon", name: "Moon", keywords: ["night", "dark"] },
  ];

  const factory = createIconFactory({
    id: "test",
    label: "Test Icons",
    icons: mockIcons,
    renderIcon: (item: IconItem, _opts: RenderIconOptions) => item.name,
    toIconData: (item: IconItem, _opts: SelectOptions) => ({
      type: "url" as const,
      src: `https://example.com/${item.id}.svg`,
    }),
  });

  it("should have correct id and label", () => {
    expect(factory.id).toBe("test");
    expect(factory.label).toBe("Test Icons");
  });

  it("should have a single section with all icons", () => {
    expect(factory.sections).toHaveLength(1);
    expect(factory.sections[0]!.id).toBe("all");
    expect(factory.sections[0]!.iconIds).toEqual([
      "home",
      "star",
      "heart",
      "moon",
    ]);
  });

  it("getItem should return the correct icon", () => {
    const item = factory.getItem("star");
    expect(item.id).toBe("star");
    expect(item.name).toBe("Star");
    expect(item.keywords).toEqual(["favorite", "rating"]);
  });

  it("getItem should throw for unknown id", () => {
    expect(() => factory.getItem("nonexistent")).toThrow(
      'Icon "nonexistent" not found',
    );
  });

  it("search should find icons by name", () => {
    const results = factory.search("star");
    expect(results).toContain("star");
    expect(results).not.toContain("home");
  });

  it("search should find icons by keyword", () => {
    const results = factory.search("favorite");
    expect(results).toContain("star");
    expect(results).toContain("heart");
    expect(results).not.toContain("moon");
  });

  it("search should be case-insensitive", () => {
    const results = factory.search("STAR");
    expect(results).toContain("star");
  });

  it("search should return empty for empty query", () => {
    expect(factory.search("")).toEqual([]);
    expect(factory.search("  ")).toEqual([]);
  });

  it("search should return empty for no matches", () => {
    expect(factory.search("zzzzzzz")).toEqual([]);
  });

  it("toIconData should generate correct data", () => {
    const item = factory.getItem("home");
    const data = factory.toIconData(item, {});
    expect(data).toEqual({ type: "url", src: "https://example.com/home.svg" });
  });

  it("renderIcon should return the icon name", () => {
    const item = factory.getItem("heart");
    const rendered = factory.renderIcon(item, {});
    expect(rendered).toBe("Heart");
  });
});
