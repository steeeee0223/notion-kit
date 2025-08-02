import type { Updater } from "@tanstack/react-table";

import type { IconData } from "@notion-kit/icon-block";

import type { CellPlugin } from "../types";

export interface TitleConfig {
  showIcon?: boolean;
}

export interface TitleActions {
  id: string;
  updater: Updater<boolean>;
}

export type TitlePlugin = CellPlugin<
  "title",
  { value: string; icon?: IconData },
  TitleConfig,
  TitleActions
>;
