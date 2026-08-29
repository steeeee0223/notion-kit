import { renderHook } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import type { ColumnInfo, Row } from "@/lib/types";
import { arrayToEntity } from "@/lib/utils";
import { createMockPlugins, createMockTableFixture } from "@/mock";
import type { BaseTableProps } from "@/table-contexts";
import { useTableView } from "@/table-contexts/use-table-view";

export const plugins = arrayToEntity(createMockPlugins());

const fixture = createMockTableFixture();
export const mockProperties: ColumnInfo[] = fixture.properties;
export const mockData: Row[] = fixture.data;

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
