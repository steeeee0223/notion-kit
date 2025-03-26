"use client";

import React from "react";

import type { IconData } from "../lib";

interface IconMenuState<Data extends IconData, Category extends string> {
  hasFound: boolean;
  isSearching: boolean;
  searchResult: Data[];
  searchValue: string;
  visibleCategories: Map<Category, boolean>;
  emoji?: Category;
  focusedCategory?: Category;
  frequentEmoji?: string;
}

type IconMenuAction<Data extends IconData, Category extends string> =
  | { type: "CLEAR_SEARCH" }
  | { type: "UPDATE_FREQUENT_EMOJIS"; payload: string }
  | { type: "SET_FOCUSED_CATEGORY"; payload: Category }
  | {
      type: "SET_FOCUSED_AND_VISIBLE_CATEGORIES";
      payload: Pick<
        IconMenuState<Data, Category>,
        "visibleCategories" | "focusedCategory"
      >;
    }
  | {
      type: "UPDATE_SEARCH_RESULT";
      payload: Pick<
        IconMenuState<Data, Category>,
        "hasFound" | "searchResult" | "searchValue"
      >;
    };

const initialState: IconMenuState<IconData, string> = {
  emoji: undefined,
  focusedCategory: undefined,
  frequentEmoji: undefined,
  hasFound: false,
  isSearching: false,
  searchResult: [],
  searchValue: "",
  visibleCategories: new Map(),
};

export function useIconMenuState<
  Data extends IconData,
  Category extends string,
>(): [
  IconMenuState<Data, Category>,
  React.Dispatch<IconMenuAction<Data, Category>>,
] {
  const [cache, dispatch] = React.useReducer(
    (
      state: IconMenuState<Data, Category>,
      action: IconMenuAction<Data, Category>,
    ) => {
      switch (action.type) {
        case "CLEAR_SEARCH":
          return {
            ...state,
            focusedCategory: "frequent" as Category,
            hasFound: false,
            isSearching: false,
            searchValue: "",
          };
        case "SET_FOCUSED_AND_VISIBLE_CATEGORIES":
          return { ...state, ...action.payload };
        case "SET_FOCUSED_CATEGORY":
          return {
            ...state,
            focusedCategory: action.payload,
            hasFound: false,
            isSearching: false,
            searchValue: "",
          };
        case "UPDATE_FREQUENT_EMOJIS":
          return { ...state, frequentEmoji: action.payload, emoji: undefined };
        case "UPDATE_SEARCH_RESULT":
          return {
            ...state,
            ...action.payload,
            focusedCategory: undefined,
            isSearching: true,
          };
        default:
          throw new Error(`Unhandled action type`);
      }
    },
    initialState as IconMenuState<Data, Category>,
  );

  return [cache, dispatch];
}
