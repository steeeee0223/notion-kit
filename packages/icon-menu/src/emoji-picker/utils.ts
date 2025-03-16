import React from "react";
import { Emoji, EmojiMartData } from "@emoji-mart/data";

import type { IconData, IIconLibrary } from "../lib";
import type { EmojiLibraryData, Skin } from "./types";

export function toLibraryData(data: EmojiMartData): EmojiLibraryData {
  return {
    categories: data.categories.map(({ id, emojis }) => ({
      id,
      icons: emojis,
    })),
    icons: data.emojis,
    aliases: data.aliases,
  };
}

export function getNativeEmoji(emoji: Emoji, skin: Skin) {
  const idx = emoji.skins.length >= 6 ? Number(skin) - 1 : 0;
  return emoji.skins[idx]!.native;
}

interface ObserverCategoriesParams<Category extends string> {
  ancestorRef: React.RefObject<HTMLDivElement | null>;
  emojiLibrary: IIconLibrary<IconData, Category>;
  setFocusedAndVisibleSections: (
    visibleSections: Map<Category, boolean>,
    categoryId?: Category,
  ) => void;
}

export function observeCategories<Category extends string>({
  ancestorRef,
  emojiLibrary,
  setFocusedAndVisibleSections,
}: ObserverCategoriesParams<Category>) {
  const observerOptions = {
    root: ancestorRef.current,
    threshold: 0,
  };

  const visibleSections = new Map<Category, boolean>();

  const observer = new IntersectionObserver((entries) => {
    setVisibleSections(entries, visibleSections);
    const focusedSectionId = getSectionInFocus(visibleSections);

    if (focusedSectionId)
      setFocusedAndVisibleSections(visibleSections, focusedSectionId);
  }, observerOptions);

  for (const section of emojiLibrary.getGrid().sections()) {
    if (section.root.current) observer.observe(section.root.current);
  }

  return observer;
}

function setVisibleSections<Category extends string>(
  entries: IntersectionObserverEntry[],
  visibleSections: Map<Category, boolean>,
) {
  for (const entry of entries) {
    const id = (entry.target as HTMLDivElement).dataset.id as Category;
    visibleSections.set(id, entry.isIntersecting);
  }
}

function getSectionInFocus<Category extends string>(
  visibleSections: Map<Category, boolean>,
): Category | undefined {
  for (const [id, ratio] of visibleSections) {
    if (ratio) return id;
  }
}
