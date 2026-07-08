import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IconMenuObject } from "@/__tests__/component-objects/icon-menu";
import { createIconFactory } from "@/icon-menu";

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
    expect(menu.queryTab("Upload")).not.toBeInTheDocument();
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

  it("IconMenu_SearchByKeyword_ShowsMatchingIcon", async () => {
    const factory = createIconFactory({
      id: "icons",
      label: "Icons",
      icons: [{ id: "star", name: "Star", keywords: ["favorite", "rating"] }],
      renderIcon: (item) => <span>{item.name}</span>,
      toIconData: (item) => ({
        type: "url",
        src: `https://example.com/${item.id}.svg`,
      }),
    });
    const menu = IconMenuObject.render({
      factories: [factory],
      onSelect: vi.fn(),
    });
    await menu.open();
    await menu.selectTab("Icons");

    await menu.search("favorite");

    expect(menu.iconOption("Star")).toBeInTheDocument();
  });

  it("IconMenu_SearchWithNoMatch_ShowsNoResults", async () => {
    const factory = createIconFactory({
      id: "icons",
      label: "Icons",
      icons: [{ id: "star", name: "Star", keywords: ["favorite", "rating"] }],
      renderIcon: (item) => <span>{item.name}</span>,
      toIconData: (item) => ({
        type: "url",
        src: `https://example.com/${item.id}.svg`,
      }),
    });
    const menu = IconMenuObject.render({
      factories: [factory],
      onSelect: vi.fn(),
    });
    await menu.open();
    await menu.selectTab("Icons");

    await menu.search("zzzz");

    expect(screen.getByText("No results")).toBeVisible();
  });

  it("IconMenu_OpenWithGroupedIcons_RendersSectionLabelsAsVirtualRows", async () => {
    const icons = Array.from({ length: 14 }, (_, index) => ({
      id: `icon-${index}`,
      name: `Icon ${index}`,
    }));
    const factory = createIconFactory({
      id: "icons",
      label: "Icons",
      icons,
      sections: [
        {
          id: "primary",
          label: "Primary",
          iconIds: icons.slice(0, 13).map((icon) => icon.id),
        },
        {
          id: "secondary",
          label: "Secondary",
          iconIds: icons.slice(13).map((icon) => icon.id),
        },
      ],
      renderIcon: (item) => <span>{item.name}</span>,
      toIconData: (item) => ({
        type: "url",
        src: `https://example.com/${item.id}.svg`,
      }),
    });
    const menu = IconMenuObject.render({
      factories: [factory],
      onSelect: vi.fn(),
    });
    await menu.open();
    await menu.selectTab("Icons");

    const primaryLabel = screen
      .getByText("Primary")
      .closest('[data-slot="autocomplete-label"]');

    const secondaryLabel = screen
      .getByText("Secondary")
      .closest('[data-slot="autocomplete-label"]');

    expect(primaryLabel).not.toHaveClass("sticky");
    expect(secondaryLabel).not.toHaveClass("sticky");
    expect(menu.iconOption("Icon 0")).toBeInTheDocument();
    expect(menu.iconOption("Icon 13")).toBeInTheDocument();
  });

  it("IconMenu_TabChanged_ClearsSearchInput", async () => {
    const menu = IconMenuObject.render({ onSelect: vi.fn() });
    await menu.open();
    await menu.selectTab("Icons");
    await menu.search("heart");

    await menu.selectTab("Emojis");

    expect(menu.searchInput()).toHaveValue("");
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
