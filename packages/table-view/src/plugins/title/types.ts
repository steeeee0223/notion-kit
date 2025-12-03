import type { CellPlugin } from "../types";

export interface TitleConfig {
  showIcon?: boolean;
}

export type TitlePlugin = CellPlugin<"title", string, TitleConfig>;
