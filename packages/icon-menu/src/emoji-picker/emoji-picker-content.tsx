"use client";

import React, { useCallback } from "react";

import { HintProvider } from "@notion-kit/common";

import { MenuSectionTitle } from "../_components";
import { EmojiButton, EmojiPickerRow } from "./emoji-picker-row";
import type { EmojiCategoryList, UseEmojiPickerType } from "./types";

type EmojiPickerContentProps = Pick<
  UseEmojiPickerType,
  | "emojiLibrary"
  | "skin"
  | "i18n"
  | "isSearching"
  | "refs"
  | "searchResult"
  | "settings"
  | "visibleCategories"
  | "onSelectEmoji"
>;

export const EmojiPickerContent: React.FC<EmojiPickerContentProps> = ({
  emojiLibrary,
  skin,
  i18n,
  isSearching = false,
  refs,
  searchResult,
  settings,
  visibleCategories,
  onSelectEmoji,
}) => {
  const isCategoryVisible = useCallback(
    (categoryId: EmojiCategoryList) =>
      visibleCategories.has(categoryId)
        ? visibleCategories.get(categoryId)
        : false,
    [visibleCategories],
  );

  const EmojiList = useCallback(() => {
    return emojiLibrary
      .getGrid()
      .sections()
      .map(({ id: categoryId }) => {
        const section = emojiLibrary.getGrid().section(categoryId);

        return (
          <div
            key={categoryId}
            ref={section.root}
            className="w-full"
            data-id={categoryId}
          >
            <MenuSectionTitle
              title={i18n.categories[categoryId]}
              className="sticky -top-px z-[1] bg-popover"
            />
            <div
              className="relative flex flex-wrap"
              style={{ height: section.getRows().length * settings.buttonSize }}
            >
              {isCategoryVisible(categoryId) &&
                section
                  .getRows()
                  .map((row) => (
                    <EmojiPickerRow
                      key={row.id}
                      row={row}
                      skin={skin}
                      emojiLibrary={emojiLibrary}
                      onSelectEmoji={onSelectEmoji}
                    />
                  ))}
            </div>
          </div>
        );
      });
  }, [
    emojiLibrary,
    i18n.categories,
    isCategoryVisible,
    onSelectEmoji,
    settings,
    skin,
  ]);

  const SearchList = useCallback(() => {
    return (
      <div className="mr-3 w-full" data-id="search">
        <MenuSectionTitle
          title={searchResult.length > 0 ? i18n.searchResult : "No results"}
          className="sticky -top-px z-[1] bg-popover"
        />
        <div className="relative flex flex-wrap">
          {searchResult.map((emoji, index) => (
            <EmojiButton
              key={emoji.id}
              index={index}
              emoji={emojiLibrary.getIcon(emoji.id)}
              skin={skin}
              onSelect={onSelectEmoji}
            />
          ))}
        </div>
      </div>
    );
  }, [emojiLibrary, skin, i18n.searchResult, searchResult, onSelectEmoji]);

  return (
    <HintProvider delayDuration={500}>
      <div
        ref={refs.current.contentRoot}
        className="-mr-3 notion-scrollbar h-[214px] overflow-x-hidden overflow-y-auto dark:notion-scrollbar-dark"
        data-id="scroll"
      >
        <div ref={refs.current.content} className="h-full">
          {isSearching ? SearchList() : EmojiList()}
        </div>
      </div>
    </HintProvider>
  );
};
