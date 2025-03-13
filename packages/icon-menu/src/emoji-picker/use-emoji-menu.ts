"use client";

import type { Emoji } from "@emoji-mart/data";
import type {
  EmojiCategoryList,
  EmojiSettingsType,
} from "@udecode/plate-emoji";
import type { SetFocusedAndVisibleSectionsType } from "@udecode/plate-emoji/react";
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EmojiFloatingIndexSearch, i18n } from "@udecode/plate-emoji";
import {
  EmojiFloatingLibrary,
  EmojiPickerState,
  FrequentEmojiStorage,
  observeCategories,
} from "@udecode/plate-emoji/react";

import { randomItem } from "@notion-kit/utils";

import type { Skin } from "./types";
import { getNativeEmoji } from "./utils";

interface UseEmojiMenuOptions {
  settings: EmojiSettingsType;
  onSelect: (emoji: string) => void;
}

export function useEmojiMenu({ settings, onSelect }: UseEmojiMenuOptions) {
  const [emojiLibrary, indexSearch] = useMemo(() => {
    const frequentEmojiStorage = new FrequentEmojiStorage({
      limit: settings.showFrequent.limit,
    });
    const emojiLibrary = EmojiFloatingLibrary.getInstance(
      settings,
      frequentEmojiStorage,
    );
    const indexSearch = EmojiFloatingIndexSearch.getInstance(emojiLibrary);
    return [emojiLibrary, indexSearch] as const;
  }, [settings]);

  const [skin, setSkin] = useState<Skin>("1");
  const [state, dispatch] = EmojiPickerState();
  const refs = useRef({
    content: createRef<HTMLDivElement>(),
    contentRoot: createRef<HTMLDivElement>(),
  });

  const setFocusedAndVisibleSections =
    useCallback<SetFocusedAndVisibleSectionsType>(
      (visibleCategories, categoryId) =>
        dispatch({
          payload: {
            focusedCategory: categoryId,
            visibleCategories,
          },
          type: "SET_FOCUSED_AND_VISIBLE_CATEGORIES",
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
        payload: {
          hasFound,
          searchResult: indexSearch.get(),
          searchValue: value,
        },
        type: "UPDATE_SEARCH_RESULT",
      });
    },
    [dispatch, indexSearch],
  );

  const clearSearch = useCallback(
    () => dispatch({ type: "CLEAR_SEARCH" }),
    [dispatch],
  );

  /** @deprecated */
  const onMouseOver = useCallback(
    (emoji?: Emoji) => dispatch({ payload: { emoji }, type: "SET_EMOJI" }),
    [dispatch],
  );

  const selectEmoji = useCallback(
    (emoji: Emoji) => {
      onSelect(getNativeEmoji(emoji, skin));
      emojiLibrary.updateFrequentCategory(emoji.id);
      dispatch({
        payload: { frequentEmoji: emoji.id, isOpen: true },
        type: "UPDATE_FREQUENT_EMOJIS",
      });
    },
    [dispatch, onSelect, skin, emojiLibrary],
  );

  const getRandomEmoji = useCallback(() => {
    const id = emojiLibrary.getEmojiId(randomItem(emojiLibrary.keys));
    const emoji = getNativeEmoji(emojiLibrary.getEmoji(id), skin);
    onSelect(emoji);
  }, [emojiLibrary, onSelect, skin]);

  const selectCategory = useCallback(
    (categoryId: EmojiCategoryList) => {
      dispatch({
        payload: { focusedCategory: categoryId },
        type: "SET_FOCUSED_CATEGORY",
      });

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
    onMouseOver,
    ...state,
  };
}
