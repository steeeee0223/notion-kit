import type { Color } from "@notion-kit/utils";

import type { CellPlugin } from "../types";

export type NumberFormat =
  | "number"
  | "number_with_commas"
  | "percent"
  | "currency";
export type NumberRound = "default" | "0" | "1" | "2" | "3" | "4" | "5";
export type NumberDisplayType = "number" | "bar" | "ring";
export interface NumberOptions {
  color: Color;
  divideBy: number;
  showNumber?: boolean;
}

export interface NumberConfig {
  /**
   * @default format: "number"
   */
  format: NumberFormat;
  /**
   * @default round: "default"
   */
  round: NumberRound;
  /**
   * @default showAs: "number"
   */
  showAs: NumberDisplayType;
  /**
   * @default options: { color: "green", divideBy: 100, showNumber: true }
   */
  options: NumberOptions;
}

export type NumberPlugin = CellPlugin<"number", string | null, NumberConfig>;
