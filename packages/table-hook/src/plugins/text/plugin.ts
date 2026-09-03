import type { CellPlugin } from "@/plugins";
import {
  compareStrings,
  createCompareFn,
  genericCounting,
  textFilteringCapabilities,
  textMethodCapabilities,
} from "@/plugins/utils";

export type TextPlugin = CellPlugin<"text", string, undefined>;
export function text(): TextPlugin {
  const isEmpty = (data: string) => data.trim() === "";
  return {
    id: "text",
    default: {
      data: "",
      config: undefined,
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    isEmpty,
    toTextValue: (data) => data,
    compare: createCompareFn(compareStrings),
    ...textMethodCapabilities<string>(),
    ...textFilteringCapabilities(isEmpty),
    counting: genericCounting(isEmpty),
  };
}
