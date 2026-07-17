import {
  countAll,
  countEmpty,
  countNonEmpty,
  countUnique,
  countValues,
  groupByTextValue,
  percentageEmpty,
  percentageNonEmpty,
  sortByText,
} from "@/methods";
import type { CellPlugin } from "@/plugins/types";

export type TitlePlugin = CellPlugin<"title", string, { showIcon: boolean }>;
export type TextPlugin = CellPlugin<"text", string, undefined>;

const emptyIcon = null;

const genericCounting = [
  {
    group: "Count",
    functions: [countAll, countValues, countUnique, countEmpty, countNonEmpty],
  },
  {
    group: "Percentage",
    functions: [percentageEmpty, percentageNonEmpty],
  },
];

export function title(): TitlePlugin {
  return {
    id: "title",
    meta: { name: "Title", desc: "Title", icon: emptyIcon },
    default: {
      name: "Name",
      icon: emptyIcon,
      data: "",
      config: { showIcon: true },
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    toTextValue: (data) => data,
    sorting: {
      defaultMethod: sortByText.id,
      methods: [sortByText],
    },
    grouping: {
      defaultMethod: groupByTextValue.id,
      methods: [groupByTextValue],
    },
    counting: genericCounting,
    renderCell: () => null,
  };
}

export function text(): TextPlugin {
  return {
    id: "text",
    meta: { name: "Text", desc: "Text", icon: emptyIcon },
    default: {
      name: "Text",
      icon: emptyIcon,
      data: "",
      config: undefined,
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    toTextValue: (data) => data,
    sorting: {
      defaultMethod: sortByText.id,
      methods: [sortByText],
    },
    grouping: {
      defaultMethod: groupByTextValue.id,
      methods: [groupByTextValue],
    },
    counting: genericCounting,
    renderCell: () => null,
  };
}

export const DEFAULT_PLUGINS = [title(), text()];

export type DefaultPlugins = (typeof DEFAULT_PLUGINS)[number][];
export type * from "./types";
export { DefaultGroupingValue } from "./utils";
