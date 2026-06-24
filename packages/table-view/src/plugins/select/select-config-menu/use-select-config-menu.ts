"use client";

import { useCallback } from "react";

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
    (names: string[]) => {
      dispatch({
        action: "update:sort:manual",
        updater: names,
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
