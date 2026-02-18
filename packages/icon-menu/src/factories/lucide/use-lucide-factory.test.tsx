import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useLucideFactory } from "./use-lucide-factory";

describe("useLucideFactory", () => {
  it("should return a valid factory result", () => {
    const { result } = renderHook(() => useLucideFactory());
    const factory = result.current;

    expect(factory.id).toBe("lucide");
    expect(factory.label).toBe("Icons");
    expect(factory.sections.length).toBeGreaterThan(0);
  });

  it("should have an 'all' section with icons", () => {
    const { result } = renderHook(() => useLucideFactory());
    const allSection = result.current.sections.find((s) => s.id === "all");

    expect(allSection).toBeDefined();
    expect(allSection!.iconIds.length).toBeGreaterThan(100);
  });

  it("getItem should return IconItem with id and name", () => {
    const { result } = renderHook(() => useLucideFactory());
    const item = result.current.getItem("home");

    expect(item.id).toBe("home");
    expect(item.name).toBe("home");
  });

  it("search should find icons by name", () => {
    const { result } = renderHook(() => useLucideFactory());
    // Tags are fetched async, so name-based search works immediately
    const results = result.current.search("star");

    expect(results.length).toBeGreaterThan(0);
    expect(results).toContain("star");
  });

  it("search should return empty for empty query", () => {
    const { result } = renderHook(() => useLucideFactory());
    expect(result.current.search("")).toEqual([]);
  });

  it("toIconData should output lucide type with color", () => {
    const { result } = renderHook(() => useLucideFactory());
    const item = result.current.getItem("home");
    const data = result.current.toIconData(item, {});

    expect(data.type).toBe("lucide");
    expect(data.src).toBe("home");
    // Should include a color
    expect("color" in data).toBe(true);
  });

  it("toIconData should use variantValue when provided", () => {
    const { result } = renderHook(() => useLucideFactory());
    const item = result.current.getItem("home");
    const data = result.current.toIconData(item, { variantValue: "#ff0000" });

    expect(data.type).toBe("lucide");
    expect((data as { color?: string }).color).toBe("#ff0000");
  });

  it("getRandomIcon should return a valid item", () => {
    const { result } = renderHook(() => useLucideFactory());
    const item = result.current.getRandomIcon!();

    expect(item.id).toBeDefined();
    expect(typeof item.id).toBe("string");
    expect(item.id.length).toBeGreaterThan(0);
  });

  it("onSelect should be defined", () => {
    const { result } = renderHook(() => useLucideFactory());
    expect(result.current.onSelect).toBeTypeOf("function");
  });

  it("toolbar should be defined (ColorPicker)", () => {
    const { result } = renderHook(() => useLucideFactory());
    expect(result.current.toolbar).toBeDefined();
  });

  it("should accept custom default color", () => {
    const { result } = renderHook(() =>
      useLucideFactory({ defaultColor: "#FF0000" }),
    );
    const item = result.current.getItem("star");
    const data = result.current.toIconData(item, {});

    expect((data as { color?: string }).color).toBe("#FF0000");
  });
});
