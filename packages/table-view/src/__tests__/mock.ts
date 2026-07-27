import { renderHook } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import {
  arrayToEntity,
  useTableView,
  type BaseTableProps,
  type CellPlugin,
  type ColumnInfo,
  type ResourceChange,
  type Row,
  type TableViewState,
} from "@notion-kit/table-hook";

import { DEFAULT_PLUGINS } from "@/plugins";

export const plugins = arrayToEntity(DEFAULT_PLUGINS);

// Get actual configs from plugins
const textPlugin = plugins.items.text!;
const checkboxPlugin = plugins.items.checkbox!;

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

const fullPluginProperties: ColumnInfo[] = [
  {
    id: "title",
    name: "Name",
    type: "title",
    width: "220",
    config: { showIcon: true },
  },
  {
    id: "notes",
    name: "Notes",
    type: "text",
    width: "180",
    config: undefined,
  },
  {
    id: "score",
    name: "Score",
    type: "number",
    width: "120",
    config: {
      format: "number",
      round: "default",
      showAs: "number",
      options: { color: "green", divideBy: 100, showNumber: true },
    },
  },
  {
    id: "status",
    name: "Status",
    type: "select",
    width: "140",
    config: {
      sort: "manual",
      options: {
        names: ["Backlog", "Active", "Done"],
        items: {
          Backlog: { id: "option-backlog", name: "Backlog", color: "gray" },
          Active: { id: "option-active", name: "Active", color: "blue" },
          Done: { id: "option-done", name: "Done", color: "green" },
        },
      },
    },
  },
  {
    id: "tags",
    name: "Tags",
    type: "multi-select",
    width: "160",
    config: {
      sort: "manual",
      options: {
        names: ["Frontend", "Backend"],
        items: {
          Frontend: {
            id: "option-frontend",
            name: "Frontend",
            color: "purple",
          },
          Backend: {
            id: "option-backend",
            name: "Backend",
            color: "orange",
          },
        },
      },
    },
  },
  {
    id: "complete",
    name: "Complete",
    type: "checkbox",
    width: "100",
    config: undefined,
  },
  {
    id: "due",
    name: "Due",
    type: "date",
    width: "160",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
  {
    id: "email",
    name: "Email",
    type: "email",
    width: "180",
    config: undefined,
  },
  {
    id: "phone",
    name: "Phone",
    type: "phone",
    width: "160",
    config: undefined,
  },
  {
    id: "website",
    name: "Website",
    type: "url",
    width: "180",
    config: undefined,
  },
  {
    id: "created",
    name: "Created",
    type: "created-time",
    width: "180",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
  {
    id: "edited",
    name: "Edited",
    type: "last-edited-time",
    width: "180",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
];

const fullPluginData: Row[] = [
  {
    id: "row-alpha",
    icon: { type: "emoji", src: "🧪" },
    createdAt: 1_735_689_600_000,
    lastEditedAt: 1_735_689_600_000,
    properties: {
      title: { id: "cell-alpha-title", value: "Alpha" },
      notes: { id: "cell-alpha-notes", value: "first note" },
      score: { id: "cell-alpha-score", value: "10" },
      status: { id: "cell-alpha-status", value: "Active" },
      tags: { id: "cell-alpha-tags", value: ["Frontend"] },
      complete: { id: "cell-alpha-complete", value: true },
      due: { id: "cell-alpha-due", value: { start: 1_735_689_600_000 } },
      email: { id: "cell-alpha-email", value: "alpha@example.com" },
      phone: { id: "cell-alpha-phone", value: "+886900000001" },
      website: { id: "cell-alpha-website", value: "https://example.com/alpha" },
      created: { id: "cell-alpha-created", value: null },
      edited: { id: "cell-alpha-edited", value: null },
    },
  },
  {
    id: "row-empty",
    createdAt: 1_735_776_000_000,
    lastEditedAt: 1_735_776_000_000,
    properties: {
      title: { id: "cell-empty-title", value: "Empty" },
      notes: { id: "cell-empty-notes", value: "" },
      score: { id: "cell-empty-score", value: null },
      status: { id: "cell-empty-status", value: null },
      tags: { id: "cell-empty-tags", value: [] },
      complete: { id: "cell-empty-complete", value: false },
      due: { id: "cell-empty-due", value: {} },
      email: { id: "cell-empty-email", value: "" },
      phone: { id: "cell-empty-phone", value: "" },
      website: { id: "cell-empty-website", value: "" },
      created: { id: "cell-empty-created", value: null },
      edited: { id: "cell-empty-edited", value: null },
    },
  },
  {
    id: "row-omega",
    createdAt: 1_735_862_400_000,
    lastEditedAt: 1_735_862_400_000,
    properties: {
      title: { id: "cell-omega-title", value: "Omega" },
      notes: { id: "cell-omega-notes", value: "last note" },
      score: { id: "cell-omega-score", value: "90" },
      status: { id: "cell-omega-status", value: "Done" },
      tags: { id: "cell-omega-tags", value: ["Frontend", "Backend"] },
      complete: { id: "cell-omega-complete", value: false },
      due: { id: "cell-omega-due", value: { start: 1_736_035_200_000 } },
      email: { id: "cell-omega-email", value: "omega@example.com" },
      phone: { id: "cell-omega-phone", value: "+886900000003" },
      website: { id: "cell-omega-website", value: "https://example.com/omega" },
      created: { id: "cell-omega-created", value: null },
      edited: { id: "cell-omega-edited", value: null },
    },
  },
];

const fullPluginView = {
  layout: "table",
  rowView: "side",
  openedRowId: null,
  locked: false,
} satisfies TableViewState;

export function createFullPluginFixture() {
  return structuredClone({
    data: fullPluginData,
    properties: fullPluginProperties,
    view: fullPluginView,
  });
}

export function createResourceProbe<TResource, TAction>() {
  const onChange =
    vi.fn<(change: ResourceChange<TResource, TAction>) => void>();

  return {
    onChange,
    lastChange() {
      const change = onChange.mock.lastCall?.[0];
      if (!change)
        throw new Error("Expected the resource probe to receive a change");
      return change;
    },
  };
}

export function renderTableHook(options: BaseTableProps<CellPlugin[]>) {
  const legacyOptions = options as BaseTableProps<CellPlugin[]> & {
    data?: Row[];
    properties?: ColumnInfo[];
  };
  const { data, properties, ...rest } = legacyOptions;
  const { result } = renderHook(() =>
    useTableView({
      ...rest,
      defaultData: rest.defaultData ?? data,
      defaultProperties: rest.defaultProperties ?? properties,
      plugins,
    }),
  );
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
    // Mock scrollIntoView for menu primitives
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
