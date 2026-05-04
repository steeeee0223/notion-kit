import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useEmojiFactory } from "./use-emoji-factory";

describe("useEmojiFactory", () => {
  it("should return a valid factory result", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const factory = result.current;

    expect(factory.id).toBe("emoji");
    expect(factory.label).toBe("Emojis");
    expect(factory.sections.length).toBeGreaterThan(0);
  });

  it("should have standard emoji categories", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const sectionIds = result.current.sections.map((s) => s.id);

    // Should include standard emoji categories
    expect(sectionIds).toContain("people");
    expect(sectionIds).toContain("nature");
    expect(sectionIds).toContain("foods");
    expect(sectionIds).toContain("activity");
  });

  it("getItem should return an IconItem for a known emoji", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const item = result.current.getItem("+1");

    expect(item.id).toBe("+1");
    expect(item.name).toBe("Thumbs Up");
    expect(item.keywords).toBeDefined();
  });

  it("getItem should return a fallback for unknown emoji", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const item = result.current.getItem("__nonexistent__");

    expect(item.id).toBe("__nonexistent__");
    expect(item.name).toBe("__nonexistent__");
  });

  it("search should find emojis by name", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const results = result.current.search("heart");

    expect(results.length).toBeGreaterThan(0);
    expect(results).toContain("heart");
  });

  it("search should find emojis by keyword", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const results = result.current.search("love");

    expect(results.length).toBeGreaterThan(0);
  });

  it("search should return empty for no match", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const results = result.current.search("zzzznonexistent");

    expect(results).toEqual([]);
  });

  it("search should return empty for empty string", () => {
    const { result } = renderHook(() => useEmojiFactory());
    expect(result.current.search("")).toEqual([]);
  });

  it("toIconData should output an emoji type with native character", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const item = result.current.getItem("+1");
    const data = result.current.toIconData(item, {});

    expect(data.type).toBe("emoji");
    expect(data.src).toBeDefined();
    expect(typeof data.src).toBe("string");
    // Should be a native emoji character, not the id
    expect(data.src).not.toBe("+1");
  });

  it("getRandomIcon should return a valid item", () => {
    const { result } = renderHook(() => useEmojiFactory());
    const item = result.current.getRandomIcon!();

    expect(item.id).toBeDefined();
    expect(item.name).toBeDefined();
  });

  it("onSelect should be defined", () => {
    const { result } = renderHook(() => useEmojiFactory());
    expect(result.current.onSelect).toBeTypeOf("function");
  });

  it("toolbar should be defined (SkinPicker)", () => {
    const { result } = renderHook(() => useEmojiFactory());
    expect(result.current.toolbar).toBeDefined();
  });
});
