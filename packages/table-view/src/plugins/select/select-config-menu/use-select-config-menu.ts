"use client";

import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { getRandomColor, type Color } from "@notion-kit/utils";

import { useTableViewCtx } from "../../../table-contexts";
import type { SelectActions, SelectConfig, SelectSort } from "../types";

interface UseSelectConfigMenuOptions {
  propId: string;
  config: SelectConfig;
}

export function useSelectConfigMenu({
  propId,
  config,
}: UseSelectConfigMenuOptions) {
  const { table } = useTableViewCtx();

  const updateSort = useCallback(
    (sort: SelectSort) =>
      table.setColumnTypeConfig(propId, {
        id: propId,
        action: "update:sort",
        payload: sort,
      } satisfies SelectActions),
    [table, propId],
  );

  const addOption = useCallback(
    (name: string) => {
      table.setColumnTypeConfig(propId, {
        id: propId,
        action: "add:option",
        payload: { name, color: getRandomColor() },
      } satisfies SelectActions);
    },
    [table, propId],
  );

  const reorderOptions = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      table.setColumnTypeConfig(propId, {
        id: propId,
        action: "update:sort:manual",
        updater: (prev) => {
          const oldIndex = prev.indexOf(active.id as string);
          const newIndex = prev.indexOf(over.id as string);
          return arrayMove(prev, oldIndex, newIndex);
        },
      } satisfies SelectActions);
    },
    [table, propId],
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
      table.setColumnTypeConfig(propId, {
        id: propId,
        action: "update:option",
        payload: { originalName, ...data },
      } satisfies SelectActions),
    [table, propId],
  );

  const deleteOption = useCallback(
    (name: string) =>
      table.setColumnTypeConfig(propId, {
        id: propId,
        action: "delete:option",
        payload: name,
      } satisfies SelectActions),
    [table, propId],
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
