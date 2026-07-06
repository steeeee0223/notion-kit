import { useCallback, useMemo, useState } from "react";
import type { OnChangeFn } from "@tanstack/react-table";

import { idToColorKey, type Color } from "@notion-kit/utils";

import { useTableViewCtx } from "@/table-contexts";

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

  const [search, setSearch] = useState("");
  const optionSuggestion = useMemo(
    () =>
      search && !config.options.items[search]
        ? { name: search, color: idToColorKey(search) }
        : undefined,
    [config.options.items, search],
  );

  /** Config Actions */
  const addOption = useCallback(() => {
    if (!optionSuggestion) return;
    setSearch("");
    dispatchConfig({
      action: "add:option",
      payload: optionSuggestion,
    });
    onChange(
      multi ? [...options, optionSuggestion.name] : [optionSuggestion.name],
    );
  }, [optionSuggestion, dispatchConfig, multi, options, onChange]);

  const reorderOptions = useCallback(
    (names: string[]) => {
      dispatchConfig({
        action: "update:sort:manual",
        updater: names,
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
      if (data.name && options.includes(originalName)) {
        onChange(options.map((n) => (n === originalName ? data.name! : n)));
      }
    },
    [dispatchConfig, options, onChange],
  );

  const deleteOption = useCallback(
    (name: string) => {
      dispatchConfig({
        action: "delete:option",
        payload: name,
      });
      if (options.includes(name)) {
        onChange(options.filter((n) => n !== name));
      }
    },
    [dispatchConfig, options, onChange],
  );

  /** Search & Filter */
  const handleTagsChange = useCallback(
    (tags: string[]) => {
      const newTag = tags.find((tag) => !config.options.items[tag]);
      // If receives new tag from the creatable combobox item
      if (newTag) {
        addOption();
        return;
      }
      onChange(tags.slice(multi ? 0 : -1));
    },
    [multi, config.options.items, addOption, onChange],
  );

  const selectTag = useCallback(
    (value: string) => {
      setSearch("");
      if (options.includes(value)) return;
      onChange(multi ? [...options, value] : [value]);
    },
    [options, multi, onChange],
  );

  const tags = useMemo(
    () =>
      options.map((name) => ({
        value: name,
        color: config.options.items[name]?.color,
      })),
    [options, config.options.items],
  );

  return {
    config,
    tags,
    optionSuggestion,
    search,
    setSearch,
    handleTagsChange,
    selectTag,
    addOption,
    reorderOptions,
    validateOptionName,
    updateOption,
    deleteOption,
  };
}

export type SelectMenuApi = ReturnType<typeof useSelectMenu>;
