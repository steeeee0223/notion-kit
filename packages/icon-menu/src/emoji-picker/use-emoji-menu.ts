"use client";

import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import emojiMartData, { Emoji, EmojiMartData } from "@emoji-mart/data";

import { randomItem } from "@notion-kit/utils";

import { useIconMenuState } from "../hooks";
import {
  FrequentIconStorage,
  IconIndexSearch,
  IconLibrary,
  IconSettingsType,
} from "../lib";
import { i18n } from "./constants";
import type {
  EmojiCategoryList,
  SetFocusedAndVisibleSectionsType,
  Skin,
} from "./types";
import { getNativeEmoji, observeCategories, toLibraryData } from "./utils";

interface UseEmojiMenuOptions {
  settings: IconSettingsType<EmojiCategoryList>;
  onSelect: (emoji: string) => void;
}

export function useEmojiMenu({ settings, onSelect }: UseEmojiMenuOptions) {
  const [emojiLibrary, indexSearch] = useMemo(() => {
    const frequentEmojiStorage = new FrequentIconStorage({
      limit: settings.showFrequent.limit,
    });
    const emojiLibrary = IconLibrary.getInstance(
      settings,
      frequentEmojiStorage,
      toLibraryData(emojiMartData as EmojiMartData),
    );
    const indexSearch = IconIndexSearch.getInstance(
      emojiLibrary,
      settings.maxSearchResult,
    );
    return [emojiLibrary, indexSearch] as const;
  }, [settings]);

  const [skin, setSkin] = useState<Skin>("1");
  const [state, dispatch] = useIconMenuState<Emoji, EmojiCategoryList>();
  const refs = useRef({
    content: createRef<HTMLDivElement>(),
    contentRoot: createRef<HTMLDivElement>(),
  });

  const setFocusedAndVisibleSections =
    useCallback<SetFocusedAndVisibleSectionsType>(
      (visibleCategories, categoryId) =>
        dispatch({
          type: "SET_FOCUSED_AND_VISIBLE_CATEGORIES",
          payload: {
            focusedCategory: categoryId,
            visibleCategories,
          },
        }),
      [dispatch],
    );

  const setSearch = useCallback(
    (input: string) => {
      const value = input.trim().replaceAll(/\s/g, ""); // Normalize input
      if (!value) {
        dispatch({ type: "CLEAR_SEARCH" }); // Clear search if input is empty
        return;
      }

      const hasFound = indexSearch.search(value).hasFound();
      dispatch({
        type: "UPDATE_SEARCH_RESULT",
        payload: {
          hasFound,
          searchResult: indexSearch.get(),
          searchValue: value,
        },
      });
    },
    [dispatch, indexSearch],
  );

  const clearSearch = useCallback(
    () => dispatch({ type: "CLEAR_SEARCH" }),
    [dispatch],
  );

  const selectEmoji = useCallback(
    (emoji: Emoji) => {
      onSelect(getNativeEmoji(emoji, skin));
      emojiLibrary.updateFrequentCategory(emoji.id);
      dispatch({ type: "UPDATE_FREQUENT_EMOJIS", payload: emoji.id });
    },
    [dispatch, onSelect, skin, emojiLibrary],
  );

  const getRandomEmoji = useCallback(() => {
    const id = emojiLibrary.getIconId(randomItem(emojiLibrary.keys));
    const emoji = getNativeEmoji(emojiLibrary.getIcon(id), skin);
    onSelect(emoji);
  }, [emojiLibrary, onSelect, skin]);

  const selectCategory = useCallback(
    (categoryId: EmojiCategoryList) => {
      dispatch({ type: "SET_FOCUSED_CATEGORY", payload: categoryId });

      const getSectionPositionToScrollIntoView = () => {
        const threshold = 1;
        const section = emojiLibrary.getGrid().section(categoryId);

        const contentRootScrollTop =
          refs.current.contentRoot.current?.scrollTop ?? 0;
        const contentRootTopPosition =
          refs.current.contentRoot.current?.getBoundingClientRect().top ?? 0;
        const sectionTopPosition =
          section.root.current?.getBoundingClientRect().top ?? 0;

        return (
          threshold +
          contentRootScrollTop +
          sectionTopPosition -
          contentRootTopPosition
        );
      };

      if (refs.current.contentRoot.current) {
        refs.current.contentRoot.current.scrollTop =
          getSectionPositionToScrollIntoView();
      }
    },
    [dispatch, emojiLibrary],
  );

  useEffect(() => {
    if (!state.isSearching) {
      // Timeout to allow the category element refs to populate
      setTimeout(() => {
        observeCategories({
          ancestorRef: refs.current.contentRoot,
          emojiLibrary,
          setFocusedAndVisibleSections,
        });
      }, 0);
    }
  }, [emojiLibrary, state.isSearching, setFocusedAndVisibleSections]);

  return {
    emojiLibrary,
    skin,
    i18n,
    refs,
    setSkin,
    setSearch,
    clearSearch,
    getRandomEmoji,
    selectCategory,
    selectEmoji,
    ...state,
  };
}
