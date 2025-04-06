"use client";

import React from "react";

import { MenuSearchBar } from "../_components";
import type { IconSettingsType } from "../lib";
import { EmojiSettings, SkinPalette } from "./constants";
import { EmojiPickerContent } from "./emoji-picker-content";
import { EmojiPickerNavigation } from "./emoji-picker-navigation";
import { SkinPicker } from "./skin-picker";
import { EmojiCategoryList } from "./types";
import { useEmojiMenu } from "./use-emoji-menu";

interface EmojiPickerProps {
  settings?: IconSettingsType<EmojiCategoryList>;
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  settings = EmojiSettings,
  onSelect,
}) => {
  const {
    emojiLibrary,
    focusedCategory,
    skin,
    i18n,
    isSearching,
    refs,
    searchResult,
    searchValue,
    visibleCategories,
    setSkin,
    setSearch,
    selectCategory,
    selectEmoji,
    getRandomEmoji,
  } = useEmojiMenu({ settings, onSelect });

  return (
    <div>
      <MenuSearchBar
        search={searchValue}
        onSearchChange={setSearch}
        onRandomSelect={getRandomEmoji}
        Palette={
          <SkinPicker palette={SkinPalette} value={skin} onSelect={setSkin} />
        }
      />
      <EmojiPickerContent
        emojiLibrary={emojiLibrary}
        i18n={i18n}
        skin={skin}
        isSearching={isSearching}
        refs={refs}
        searchResult={searchResult}
        settings={settings}
        visibleCategories={visibleCategories}
        onSelectEmoji={selectEmoji}
      />
      <EmojiPickerNavigation
        onClick={selectCategory}
        emojiLibrary={emojiLibrary}
        focusedCategory={focusedCategory}
        i18n={i18n}
      />
    </div>
  );
};
