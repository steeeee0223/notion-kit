"use client";

import { useCallback, useMemo, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { OnChangeFn } from "@tanstack/react-table";

import { useFilter } from "@notion-kit/hooks";
import { getRandomColor, type Color } from "@notion-kit/utils";

import { useTableViewCtx } from "../../../table-contexts";
import {
  propagateSelectEvent,
  selectConfigReducer,
  type SelectConfigActionPayload,
} from "../select-config-reducer";
import type { SelectConfig } from "../types";

interface UseSelectMenuOptions {
  multi?: boolean;
  propId: string;
  config: SelectConfig;
  options: string[];
  onChange: (options: string[]) => void;
  onConfigChange?: OnChangeFn<SelectConfig>;
}

export function useSelectMenu({
  multi,
  propId,
  config,
  options,
  onChange,
  onConfigChange,
}: UseSelectMenuOptions) {
  const { table } = useTableViewCtx();

  /** Dispatch a config action via onConfigChange, propagating rename/delete */
  const dispatchConfig = useCallback(
    (action: SelectConfigActionPayload) => {
      const { config: newConfig, nextEvent } = selectConfigReducer(
        config,
        action,
      );
      onConfigChange?.(newConfig);
      if (nextEvent) {
        const type = multi ? "multi-select" : "select";
        propagateSelectEvent(table, propId, type, nextEvent);
      }
    },
    [config, onConfigChange, table, propId, multi],
  );

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
    dispatchConfig({
      action: "add:option",
      payload: optionSuggestion,
    });
    setCurrentOptions((prev) => {
      const options = multi ? new Map(prev) : new Map();
      return options.set(optionSuggestion.name, optionSuggestion.color);
    });
    setOptionSuggestion(undefined);
  }, [optionSuggestion, dispatchConfig, multi, updateSearch]);

  const reorderOptions = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      dispatchConfig({
        action: "update:sort:manual",
        updater: (prev: string[]) => {
          const oldIndex = prev.indexOf(active.id as string);
          const newIndex = prev.indexOf(over.id as string);
          return arrayMove(prev, oldIndex, newIndex);
        },
      });
    },
    [dispatchConfig],
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
      dispatchConfig({
        action: "update:option",
        payload: { originalName, ...data },
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
    [dispatchConfig],
  );

  const deleteOption = useCallback(
    (name: string) => {
      dispatchConfig({
        action: "delete:option",
        payload: name,
      });
      setCurrentOptions((prev) => {
        const options = new Map(prev);
        options.delete(name);
        return options;
      });
      setOptionSuggestion(undefined);
    },
    [dispatchConfig],
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
            .slice(multi ? 0 : -1)
            .map((tag) => [tag, config.options.items[tag]?.color]),
        ),
      );
    },
    [multi, config.options.items, addOption],
  );

  const selectTag = useCallback(
    (value: string) => {
      updateSearch("");
      setOptionSuggestion(undefined);
      setCurrentOptions((prev) => {
        if (prev.has(value)) return prev;
        const options = multi ? new Map(prev) : new Map();
        return options.set(value, config.options.items[value]?.color);
      });
    },
    [config.options.items, multi, updateSearch],
  );

  const tags = useMemo(
    () =>
      Array.from(currentOptions.entries()).map(([value, color]) => ({
        value,
        color,
      })),
    [currentOptions],
  );

  const commitChange = useCallback(() => {
    onChange(Array.from(currentOptions.keys()));
  }, [onChange, currentOptions]);

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
    commitChange,
  };
}

export type SelectMenuApi = ReturnType<typeof useSelectMenu>;
