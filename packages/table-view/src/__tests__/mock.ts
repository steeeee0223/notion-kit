import { renderHook } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import {
  arrayToEntity,
  useTableView,
  type BaseTableProps,
  type ColumnDefs,
  type ColumnInfo,
  type ResourceChange,
  type Row,
  type TableViewState,
} from "@notion-kit/table-hook";
import {
  createMockFullTableFixture,
  createMockTableFixture,
} from "@notion-kit/table-hook/mock";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import {
  DEFAULT_PLUGINS,
  type DefaultPlugins,
  type TablePluginPair,
  type TableUiPlugin,
} from "@/plugins";

export const plugins = arrayToEntity(DEFAULT_PLUGINS.data);

export function createTestPluginPair<TData extends CellPlugin[]>(
  data: TData,
  ui: TableUiPlugin[] = data.map((plugin) => ({
    id: plugin.id,
    meta: { name: plugin.id, desc: "", icon: null },
    default: { name: plugin.id, icon: null },
    renderCell: () => null,
    renderGroupingValue: () => null,
  })),
): TablePluginPair<TData> {
  return { data, ui };
}

export function extendDefaultPlugins(
  data: CellPlugin[],
  ui: TableUiPlugin[],
): TablePluginPair {
  return {
    data: [...DEFAULT_PLUGINS.data, ...data],
    ui: [...DEFAULT_PLUGINS.ui, ...ui],
  };
}

export function createTestUiPlugin<TPlugin extends CellPlugin>(
  plugin: TPlugin,
  overrides: Partial<TableUiPlugin<TPlugin>> = {},
): TableUiPlugin<TPlugin> {
  return {
    id: plugin.id as TableUiPlugin<TPlugin>["id"],
    meta: { name: plugin.id, desc: "", icon: null },
    default: { name: plugin.id, icon: null },
    renderCell: () => null,
    renderGroupingValue: () => null,
    ...overrides,
  };
}

const fixture = createMockTableFixture();
export const mockProperties: ColumnDefs<DefaultPlugins> = fixture.properties;
export const mockData: Row<DefaultPlugins>[] = fixture.data;

export function createFullPluginFixture(): {
  properties: ColumnDefs<DefaultPlugins>;
  data: Row<DefaultPlugins>[];
  view: TableViewState;
} {
  const fullFixture = createMockFullTableFixture();
  return {
    ...fullFixture,
    properties: fullFixture.properties as ColumnDefs<DefaultPlugins>,
    data: fullFixture.data as Row<DefaultPlugins>[],
  };
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
