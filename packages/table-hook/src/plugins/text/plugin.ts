import type { CellPlugin, PluginFactoryConfig } from "@/plugins";
import {
  compareStrings,
  createCompareFn,
  genericCounting,
  textFilteringCapabilities,
  textMethodCapabilities,
} from "@/plugins/utils";

export type TextPlugin = CellPlugin<"text", string, undefined>;
export type TextPluginConfig = PluginFactoryConfig<TextPlugin>;

export function text(config: TextPluginConfig): TextPlugin {
  const isEmpty = (data: string) => data.trim() === "";
  return {
    id: "text",
    meta: {
      name: "Text",
      icon: config.icon,
      desc: "Add text that can be formatted. Great for summaries, notes, or descriptions.",
    },
    default: {
      name: "Text",
      icon: config.defaultIcon ?? config.icon,
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
    renderCellValue: config.renderCellValue,
    renderCellEditor: config.renderCellEditor,
    renderConfigMenu: config.renderConfigMenu,
    renderGroupingValue: config.renderGroupingValue,
  };
}
