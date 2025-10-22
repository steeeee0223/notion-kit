"use client";

import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { getRandomColor, type Color } from "@notion-kit/utils";

import { useTableViewCtx } from "../../../table-contexts";
import type { ConfigMenuProps } from "../../types";
import { DEFAULT_CONFIG } from "../plugin";
import type { SelectConfig, SelectPlugin, SelectSort } from "../types";

export function useSelectConfigMenu({
  propId,
  config = DEFAULT_CONFIG,
}: ConfigMenuProps<SelectConfig>) {
  const { table } = useTableViewCtx();

  const updateSort = useCallback(
    (sort: SelectSort) =>
      table.setColumnTypeConfig<SelectPlugin>(propId, {
        id: propId,
        action: "update:sort",
        payload: sort,
      }),
    [table, propId],
  );

  const addOption = useCallback(
    (name: string) => {
      table.setColumnTypeConfig<SelectPlugin>(propId, {
        id: propId,
        action: "add:option",
        payload: { name, color: getRandomColor() },
      });
    },
    [table, propId],
  );

  const reorderOptions = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      table.setColumnTypeConfig<SelectPlugin>(propId, {
        id: propId,
        action: "update:sort:manual",
        updater: (prev) => {
          const oldIndex = prev.indexOf(active.id as string);
          const newIndex = prev.indexOf(over.id as string);
          return arrayMove(prev, oldIndex, newIndex);
        },
      });
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
      table.setColumnTypeConfig<SelectPlugin>(propId, {
        id: propId,
        action: "update:option",
        payload: { originalName, ...data },
      }),
    [table, propId],
  );

  const deleteOption = useCallback(
    (name: string) =>
      table.setColumnTypeConfig<SelectPlugin>(propId, {
        id: propId,
        action: "delete:option",
        payload: name,
      }),
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
