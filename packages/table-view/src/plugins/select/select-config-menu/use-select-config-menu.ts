"use client";

import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { getRandomColor, type Color } from "@notion-kit/utils";

import type { ConfigMeta, SelectSort } from "../../../lib/types";
import { useTableActions } from "../../../table-contexts";

interface UseSelectConfigMenuOptions {
  propId: string;
  meta: ConfigMeta<"select" | "multi-select">;
}

export function useSelectConfigMenu({
  propId,
  meta,
}: UseSelectConfigMenuOptions) {
  const { dispatch } = useTableActions();

  const { type, config } = meta;

  const updateSort = useCallback(
    (sort: SelectSort) =>
      dispatch({
        type: `update:col:meta:${type}`,
        payload: { id: propId, action: "update:sort", payload: sort },
      }),
    [dispatch, propId, type],
  );

  const addOption = useCallback(
    (name: string) => {
      dispatch({
        type: `update:col:meta:${type}`,
        payload: {
          id: propId,
          action: "add:option",
          payload: { name, color: getRandomColor() },
        },
      });
    },
    [dispatch, propId, type],
  );

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
        type: `update:col:meta:${type}`,
        payload: {
          id: propId,
          action: "update:option",
          payload: { originalName, ...data },
        },
      }),
    [dispatch, type, propId],
  );

  const deleteOption = useCallback(
    (name: string) =>
      dispatch({
        type: `update:col:meta:${type}`,
        payload: { id: propId, action: "delete:option", payload: name },
      }),
    [dispatch, type, propId],
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
