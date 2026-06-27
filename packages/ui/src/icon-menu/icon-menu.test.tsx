import { describe, expect, it, vi } from "vitest";

import { IconMenuObject } from "@/__tests__/component-objects/icon-menu";

describe("IconMenu", () => {
  it("IconMenu_TriggerClicked_OpensMenu", async () => {
    const menu = IconMenuObject.render({ onSelect: vi.fn() });

    expect(menu.trigger()).toBeInTheDocument();
    await menu.open();

    expect(menu.tab("Emojis")).toBeInTheDocument();
  });

  it("IconMenu_Open_ShowsDefaultFactoryTabs", async () => {
    const menu = IconMenuObject.render({ onSelect: vi.fn() });
    await menu.open();

    expect(menu.tab("Emojis")).toBeInTheDocument();
    expect(menu.tab("Icons")).toBeInTheDocument();
    expect(menu.queryTab("Uploads")).not.toBeInTheDocument();
  });

  it("IconMenu_IconTabClicked_ActivatesIconFactory", async () => {
    const menu = IconMenuObject.render({ onSelect: vi.fn() });
    await menu.open();

    await menu.selectTab("Icons");

    expect(menu.tab("Icons")).toHaveAttribute("data-state", "active");
  });

  it("IconMenu_SearchEntered_UpdatesSearchInput", async () => {
    const menu = IconMenuObject.render({ onSelect: vi.fn() });
    await menu.open();

    await menu.search("heart");

    expect(menu.searchInput()).toHaveValue("heart");
  });

  it("IconMenu_RemoveClicked_CallsOnRemove", async () => {
    const onRemove = vi.fn();
    const menu = IconMenuObject.render({ onSelect: vi.fn(), onRemove });
    await menu.open();

    await menu.remove();

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("IconMenu_WithUploadHandler_ShowsUploadTab", async () => {
    const menu = IconMenuObject.render({
      onSelect: vi.fn(),
      onUpload: vi.fn(),
    });
    await menu.open();

    expect(menu.tab("Upload")).toBeInTheDocument();
  });

  it("IconMenu_WithoutUploadHandler_HidesUploadTab", async () => {
    const menu = IconMenuObject.render({ onSelect: vi.fn() });
    await menu.open();

    expect(menu.tab("Emojis")).toBeInTheDocument();
    expect(menu.queryTab("Upload")).not.toBeInTheDocument();
  });

  it("IconMenu_UrlSubmitted_SelectsUrlIcon", async () => {
    const onSelect = vi.fn();
    const menu = IconMenuObject.render({ onSelect, onUpload: vi.fn() });
    await menu.open();

    await menu.submitUrl("https://example.com/icon.png");

    expect(onSelect).toHaveBeenCalledWith({
      type: "url",
      src: "https://example.com/icon.png",
    });
  });

  it("IconMenu_UrlSubmitted_PersistsUpload", async () => {
    localStorage.clear();
    const menu = IconMenuObject.render({
      onSelect: vi.fn(),
      onUpload: vi.fn(),
    });
    await menu.open();

    await menu.submitUrl("https://example.com/icon.png");

    const stored = JSON.parse(
      localStorage.getItem("icon-menu:upload") ?? "[]",
    ) as unknown[];
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://example.com/icon.png" }),
      ]),
    );
  });
});
