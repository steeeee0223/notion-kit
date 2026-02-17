"use client";

import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { getRandomColor, type Color } from "@notion-kit/utils";

import { useTableViewCtx } from "../../../table-contexts";
import type { ConfigMenuProps } from "../../types";
import {
  propagateSelectEvent,
  selectConfigReducer,
  type SelectConfigActionPayload,
} from "../select-config-reducer";
import type { SelectConfig, SelectSort } from "../types";

interface UseSelectConfigMenuOptions extends ConfigMenuProps<SelectConfig> {
  multi?: boolean;
}

export function useSelectConfigMenu({
  multi,
  propId,
  config,
  onChange,
}: UseSelectConfigMenuOptions) {
  const { table } = useTableViewCtx();

  /** Dispatch a config action, propagating rename/delete to cell data */
  const dispatch = useCallback(
    (action: SelectConfigActionPayload) => {
      const { config: newConfig, nextEvent } = selectConfigReducer(
        config,
        action,
      );
      onChange(newConfig);
      if (nextEvent)
        propagateSelectEvent(
          table,
          propId,
          multi ? "multi-select" : "select",
          nextEvent,
        );
    },
    [config, onChange, table, propId, multi],
  );

  const updateSort = useCallback(
    (sort: SelectSort) => dispatch({ action: "update:sort", payload: sort }),
    [dispatch],
  );

  const addOption = useCallback(
    (name: string) =>
      dispatch({
        action: "add:option",
        payload: { name, color: getRandomColor() },
      }),
    [dispatch],
  );

  const reorderOptions = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      dispatch({
        action: "update:sort:manual",
        updater: (prev) => {
          const oldIndex = prev.indexOf(active.id as string);
          const newIndex = prev.indexOf(over.id as string);
          return arrayMove(prev, oldIndex, newIndex);
        },
      });
    },
    [dispatch],
  );

  const validateOptionName = useCallback(
    (name: string) =>
      !Object.values(config.options.items).some(
        (option) => option.name === name,
      ),
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
    ) =>
      dispatch({
        action: "update:option",
        payload: { originalName, ...data },
      }),
    [dispatch],
  );

  const deleteOption = useCallback(
    (name: string) =>
      dispatch({
        action: "delete:option",
        payload: name,
      }),
    [dispatch],
  );

  return {
    addOption,
    reorderOptions,
    validateOptionName,
    updateOption,
    updateSort,
    deleteOption,
  };
}
