import { renderHook } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import {
  countAll,
  countChecked,
  countEmpty,
  countNonEmpty,
  countUnchecked,
  countUnique,
  countValues,
  groupByTextValue,
  groupByValue,
  percentageChecked,
  percentageEmpty,
  percentageNonEmpty,
  percentageUnchecked,
  sortByCheckbox,
  sortByNumber,
  sortByText,
} from "@/methods";
import { DEFAULT_PLUGINS, type CellPlugin } from "@/plugins";
import type { BaseTableProps } from "@/table-contexts";
import { useTableView } from "@/table-contexts/use-table-view";

type TestCheckboxPlugin = CellPlugin<"checkbox", boolean, undefined>;
type TestNumberPlugin = CellPlugin<"number", number | null, undefined>;
type TestSelectPlugin = CellPlugin<
  "select",
  { name: string } | null,
  undefined
>;

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

const checkboxCounting = [
  {
    group: "Count",
    functions: [countAll, countChecked, countUnchecked],
  },
  {
    group: "Percentage",
    functions: [percentageChecked, percentageUnchecked],
  },
];

const checkboxPlugin: TestCheckboxPlugin = {
  id: "checkbox",
  meta: { name: "Checkbox", desc: "Checkbox", icon: null },
  default: {
    name: "Checkbox",
    icon: null,
    data: false,
    config: undefined,
  },
  fromValue: (value) => Boolean(value),
  toValue: (data) => data,
  toTextValue: (data) => (data ? "true" : ""),
  sorting: {
    defaultMethod: sortByCheckbox.id,
    methods: [sortByCheckbox],
  },
  grouping: {
    defaultMethod: groupByValue.id,
    methods: [groupByValue],
  },
  counting: checkboxCounting,
  renderCell: () => null,
};

const numberPlugin: TestNumberPlugin = {
  id: "number",
  meta: { name: "Number", desc: "Number", icon: null },
  default: {
    name: "Number",
    icon: null,
    data: null,
    config: undefined,
  },
  fromValue: (value) => {
    const next = typeof value === "number" ? value : Number(value);
    return Number.isFinite(next) ? next : null;
  },
  toValue: (data) => data,
  toTextValue: (data) => data?.toString() ?? "",
  sorting: {
    defaultMethod: sortByNumber.id,
    methods: [sortByNumber],
  },
  grouping: {
    defaultMethod: groupByValue.id,
    methods: [groupByValue],
  },
  counting: genericCounting,
  renderCell: () => null,
};

const selectPlugin: TestSelectPlugin = {
  id: "select",
  meta: { name: "Select", desc: "Select", icon: null },
  default: {
    name: "Select",
    icon: null,
    data: null,
    config: undefined,
  },
  fromValue: (value) => (value === null ? null : { name: value.toString() }),
  toValue: (data) => data?.name ?? null,
  toTextValue: (data) => data?.name ?? "",
  sorting: {
    defaultMethod: sortByText.id,
    methods: [
      {
        ...sortByText,
        function: (rowA, rowB, colId) => {
          const valueA =
            (rowA.properties[colId]?.value as { name?: string } | null)
              ?.name ?? "";
          const valueB =
            (rowB.properties[colId]?.value as { name?: string } | null)
              ?.name ?? "";
          return valueA.localeCompare(valueB);
        },
      },
    ],
  },
  grouping: {
    defaultMethod: groupByTextValue.id,
    methods: [
      {
        ...groupByTextValue,
        function: (data) => data?.name ?? "",
      },
    ],
  },
  counting: genericCounting,
  renderCell: () => null,
};

export const plugins = arrayToEntity([
  ...DEFAULT_PLUGINS,
  checkboxPlugin,
  numberPlugin,
  selectPlugin,
]);

// Get actual configs from plugins
const textPlugin = plugins.items.text!;

export const mockProperties: ColumnInfo[] = [
  {
    id: "col1",
    name: "Name",
    type: "text",
    width: "200",
    config: textPlugin.default.config,
  },
  {
    id: "col2",
    name: "Done",
    type: "checkbox",
    width: "100",
    config: checkboxPlugin.default.config,
  },
];

export const mockData: Row[] = [
  {
    id: "row1",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell1", value: "Task 1" },
      col2: { id: "cell2", value: true },
    },
  },
  {
    id: "row2",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell3", value: "" },
      col2: { id: "cell4", value: false },
    },
  },
  {
    id: "row3",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell5", value: "Task 3" },
      col2: { id: "cell6", value: true },
    },
  },
];

export function renderTableHook(options: BaseTableProps<CellPlugin[]>) {
  const { result } = renderHook(() => useTableView({ ...options, plugins }));
  return result.current;
}

export function mockResizeObserver() {
  // Mock ResizeObserver for Radix UI components
  class ResizeObserverMock {
    observe() {
      /* noop */
    }
    unobserve() {
      /* noop */
    }
    disconnect() {
      /* noop */
    }
  }

  beforeEach(() => {
    global.ResizeObserver = ResizeObserverMock;
    // Mock scrollIntoView for cmdk
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });
}
