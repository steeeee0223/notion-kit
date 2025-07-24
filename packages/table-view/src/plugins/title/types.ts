import type { Updater } from "@tanstack/react-table";

import type { IconData } from "@notion-kit/icon-block";

import type { CellPlugin } from "../types";

export interface TitleConfig {
  showIcon?: boolean;
}

export interface TitleActionPayload {
  type: "update:col:meta:title";
  payload: { id: string; updater: Updater<boolean> };
}

export type TitlePlugin = CellPlugin<
  "title",
  { value: string; icon?: IconData },
  TitleConfig,
  TitleActionPayload
>;
