import type { CellPlugin } from "@notion-kit/table-hook";

export interface TitleConfig {
  showIcon?: boolean;
}

export type TitlePlugin = CellPlugin<"title", string, TitleConfig>;
