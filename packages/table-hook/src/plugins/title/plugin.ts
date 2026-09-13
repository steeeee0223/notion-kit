import type { CellPlugin } from "@/plugins";
import {
  compareStrings,
  createCompareFn,
  genericCounting,
  textFilteringCapabilities,
  textMethodCapabilities,
} from "@/plugins/utils";

export interface TitleConfig {
  showIcon?: boolean;
}

export type TitlePlugin = CellPlugin<"title", string, TitleConfig>;

export function title(): TitlePlugin {
  const isEmpty = (data: string) => data.trim() === "";
  return {
    id: "title",
    default: {
      data: "",
      config: { showIcon: true },
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    isEmpty,
    toTextValue: (data) => data,
    compare: createCompareFn(compareStrings),
    ...textMethodCapabilities<string>(),
    ...textFilteringCapabilities<TitleConfig>(isEmpty),
    counting: genericCounting(isEmpty),
  };
}
