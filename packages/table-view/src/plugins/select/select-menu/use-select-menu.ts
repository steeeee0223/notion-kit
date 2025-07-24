"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { useFilter } from "@notion-kit/hooks";
import { getRandomColor, type Color } from "@notion-kit/utils";

import type { DatabaseProperty } from "../../../lib/types";
import { useTableActions, useTableViewCtx } from "../../../table-contexts";

type SelectProperty = Extract<
  DatabaseProperty,
  { type: "select" | "multi-select" }
>;

interface UseSelectMenuOptions {
  propId: string;
  options: string[];
  onUpdate: (options: string[]) => void;
}

export function useSelectMenu({
  propId,
  options,
  onUpdate,
}: UseSelectMenuOptions) {
  const { properties } = useTableViewCtx();
  const { dispatch } = useTableActions();

  const { type, config } = properties[propId]! as SelectProperty;

  const [currentOptions, setCurrentOptions] = useState(
    new Map<string, Color | undefined>(
      options.map((option) => [option, config.options.items[option]?.color]),
    ),
  );
  const [optionSuggestion, setOptionSuggestion] = useState<{
    name: string;
    color: Color;
  }>();
  const { search, results, updateSearch } = useFilter(
    config.options.names,
    (option, v) => option.includes(v),
  );
  /** Config Actions */
  const addOption = useCallback(() => {
    if (!optionSuggestion) return;
    updateSearch("");
    dispatch({
      type: `update:col:meta:${type}`,
      payload: { id: propId, action: "add:option", payload: optionSuggestion },
    });
    setCurrentOptions((prev) => {
      const options = type === "multi-select" ? new Map(prev) : new Map();
      return options.set(optionSuggestion.name, optionSuggestion.color);
    });
    setOptionSuggestion(undefined);
  }, [dispatch, optionSuggestion, propId, type, updateSearch]);

  const reorderOptions = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      dispatch({
        type: `update:col:meta:${type}`,
        payload: {
          id: propId,
          action: "update:sort:manual",
          updater: (prev) => {
            const oldIndex = prev.indexOf(active.id as string);
            const newIndex = prev.indexOf(over.id as string);
            return arrayMove(prev, oldIndex, newIndex);
          },
        },
      });
    },
    [dispatch, type, propId],
  );

  const validateOptionName = useCallback(
    (name: string) => {
      if (!name.trim()) return false;
      return !Object.values(config.options.items).some(
        (option) => option.name === name,
      );
    },
    [config.options.items],
  );

  const updateOption = useCallback(
    (
      originalName: string,
      data: {
        name?: string;
        description?: string;
        color?: Color;
      },
    ) => {
      dispatch({
        type: `update:col:meta:${type}`,
        payload: {
          id: propId,
          action: "update:option",
          payload: { originalName, ...data },
        },
      });
      setCurrentOptions((prev) => {
        if (!prev.has(originalName)) return prev;
        const options = new Map(prev);
        if (data.name) {
          options.set(data.name, options.get(originalName));
          options.delete(originalName);
        } else if (data.color) {
          options.set(originalName, data.color);
        }
        return options;
      });
    },
    [dispatch, type, propId],
  );

  const deleteOption = useCallback(
    (name: string) => {
      dispatch({
        type: `update:col:meta:${type}`,
        payload: { id: propId, action: "delete:option", payload: name },
      });
      setCurrentOptions((prev) => {
        const options = new Map(prev);
        options.delete(name);
        return options;
      });
      setOptionSuggestion(undefined);
    },
    [dispatch, type, propId],
  );

  /** Search & Filter */
  const handleInputChange = useCallback(
    (input: string) => {
      updateSearch(input);
      setOptionSuggestion((prev) => {
        if (config.options.items[input]) return undefined;
        return {
          name: input,
          color: prev ? prev.color : getRandomColor(),
        };
      });
    },
    [updateSearch, config.options.items],
  );

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      const newTag = tags.find((tag) => !config.options.items[tag]);
      // If receives new tag from TagsInput
      if (newTag) {
        addOption();
        return;
      }
      setOptionSuggestion(undefined);
      setCurrentOptions(
        new Map(
          tags
            .slice(type === "multi-select" ? 0 : -1)
            .map((tag) => [tag, config.options.items[tag]?.color]),
        ),
      );
    },
    [type, config.options.items, addOption],
  );

  const selectTag = useCallback(
    (value: string) => {
      updateSearch("");
      setOptionSuggestion(undefined);
      setCurrentOptions((prev) => {
        if (prev.has(value)) return prev;
        const options = type === "multi-select" ? new Map(prev) : new Map();
        return options.set(value, config.options.items[value]?.color);
      });
    },
    [config.options.items, type, updateSearch],
  );

  const tags = useMemo(
    () =>
      Array.from(currentOptions.entries()).map(([value, color]) => ({
        value,
        color,
      })),
    [currentOptions],
  );

  useEffect(() => {
    onUpdate([...currentOptions.keys()]);
  }, [currentOptions, onUpdate]);

  return {
    config,
    tags,
    optionSuggestion,
    search,
    results,
    handleInputChange,
    handleTagsChange,
    selectTag,
    addOption,
    reorderOptions,
    validateOptionName,
    updateOption,
    deleteOption,
  };
}
