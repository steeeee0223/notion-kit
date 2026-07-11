import { renderHook } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import {
  arrayToEntity,
  useTableView,
  type BaseTableProps,
} from "@notion-kit/table-hook";

import type { ColumnInfo, Row } from "@/lib/types";
import { DEFAULT_PLUGINS, type CellPlugin } from "@/plugins";

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
