import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  functionalUpdate,
  useTable,
  type ColumnDef,
  type TableOptions,
} from "@tanstack/react-table";

import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import {
  createPluginMethodState,
  DEFAULT_FEATURES,
  validateTableFilterState,
  type FilterGroup,
  type TableFeatures,
} from "@/features";
import {
  canSelectDataCell,
  useCellSelectionDomain,
} from "@/features/cell-selection";
import { resolveDateViewRange, type TableViewState } from "@/features/menu";
import { pruneRowSelection } from "@/features/row-selection";
import type { _TableInstance } from "@/features/types";
import type { ColumnDefs, ColumnInfo, Row } from "@/lib/types";
import { type Entity } from "@/lib/utils";
import {
  createCountingAggregation,
  resolveGroupingMethod,
  resolveSortingAccessorValue,
  resolveSortingFn,
} from "@/methods";
import type {
  DataResourceAction,
  PropertiesResourceAction,
  ResourceActionFactory,
  ResourceChangeFn,
  ResourceChangeHandler,
  ViewResourceAction,
} from "@/table-contexts/actions";
import { defaultColumn } from "@/table-contexts/column";
import { createRuntimePluginMethodContext } from "@/table-contexts/plugin-method-context";
import {
  assignRowSequences,
  createRowProjector,
  nextRowSequence,
  reuseRowSequences,
} from "@/table-contexts/property-data";
import type {
  BaseTableProps,
  PartialTableViewState,
  TableState,
} from "@/table-contexts/types";
import {
  createInitialTable,
  getMinWidth,
  toPropertyEntity,
} from "@/table-contexts/utils";

type UseTableViewOptions<TPlugins extends CellPlugin[]> =
  BaseTableProps<TPlugins> & {
    plugins: Entity<TPlugins[number]>;
  };

const DEFAULT_VIEW_STATE = {
  locked: false,
  layout: "table",
  rowView: "side",
  openedRowId: null,
  dateView: {
    range: "monthly",
    datePropertyId: null,
  },
} satisfies TableViewState;

function resolveViewState(view?: PartialTableViewState): TableViewState {
  const pluginMethods = createPluginMethodState();
  const layout = view?.layout ?? DEFAULT_VIEW_STATE.layout;
  const dateView = { ...DEFAULT_VIEW_STATE.dateView, ...view?.dateView };
  return {
    ...DEFAULT_VIEW_STATE,
    ...view,
    dateView: {
      ...dateView,
      range: resolveDateViewRange(layout, dateView.range),
    },
    pluginMethods: {
      ...pluginMethods,
      ...view?.pluginMethods,
      sortingMethodByColumn: {
        ...pluginMethods.sortingMethodByColumn,
        ...view?.pluginMethods?.sortingMethodByColumn,
      },
      groupingMethodByColumn: {
        ...pluginMethods.groupingMethodByColumn,
        ...view?.pluginMethods?.groupingMethodByColumn,
      },
    },
  };
}

function getResourceMode(isControlled: boolean) {
  return isControlled ? "controlled" : "uncontrolled";
}

function isSameMethodSelection(
  left: Record<string, string | undefined> | undefined,
  right: Record<string, string | undefined> | undefined,
) {
  const leftEntries = Object.entries(left ?? {});
  const rightEntries = Object.entries(right ?? {});
  return (
    leftEntries.length === rightEntries.length &&
    leftEntries.every(([colId, methodId]) => right?.[colId] === methodId)
  );
}

function hasRelativeDateFilter(
  filters: TableViewState["filters"],
  properties: Record<string, ColumnInfo>,
  plugins: Record<string, CellPlugin>,
) {
  if (!validateTableFilterState(filters) || filters === null) return false;

  const hasRelativeRule = (group: FilterGroup): boolean =>
    group.children.some((child) => {
      if (child.kind === "group") return hasRelativeRule(child);
      const property = properties[child.propertyId];
      const operator = property
        ? plugins[property.type]?.filtering?.operators.find(
            ({ id }) => id === child.operator,
          )
        : undefined;
      return operator?.operand.kind === "relative-date";
    });

  return hasRelativeRule(filters);
}

function useOwnershipSwitchWarning(name: string, isControlled: boolean) {
  const initialMode = useRef(getResourceMode(isControlled));
  const mode = getResourceMode(isControlled);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && initialMode.current !== mode) {
      console.warn(
        `[TableView] \`${name}\` changed from ${initialMode.current} to ${mode} during one mount. This is unsupported.`,
      );
      initialMode.current = mode;
    }
  }, [mode, name]);
}

function useResourceState<TResource, TAction>({
  name,
  controlled,
  value,
  defaultValue,
  onChange,
  onProposalSettled,
}: {
  name: string;
  controlled: boolean;
  value: TResource;
  defaultValue: TResource;
  onChange: ResourceChangeHandler<TResource, TAction> | undefined;
  onProposalSettled?: (settlement: {
    authoritative: TResource;
    proposals: { next: TResource; action: TAction }[];
  }) => void;
}) {
  useOwnershipSwitchWarning(name, controlled);

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const resource = controlled ? value : uncontrolledValue;
  const pendingResourceRef = useRef(resource);
  const pendingProposalsRef = useRef<{ next: TResource; action: TAction }[]>(
    [],
  );

  useLayoutEffect(() => {
    // A committed render is the controlled owner's acceptance/rejection
    // boundary. Same-render calls compose until this authoritative rebase.
    pendingResourceRef.current = resource;
    const proposals = pendingProposalsRef.current;
    if (proposals.length === 0) return;
    pendingProposalsRef.current = [];
    onProposalSettled?.({ authoritative: resource, proposals });
  });

  const setResource = useCallback<ResourceChangeFn<TResource, TAction>>(
    (updater, action) => {
      const previous = pendingResourceRef.current;
      const next = functionalUpdate(updater, previous);
      if (Object.is(previous, next)) return;
      pendingResourceRef.current = next;
      const resolvedAction =
        typeof action === "function"
          ? (action as ResourceActionFactory<TResource, TAction>)(
              previous,
              next,
            )
          : action;
      pendingProposalsRef.current.push({ next, action: resolvedAction });
      if (!controlled) {
        setUncontrolledValue(next);
      }
      onChange?.({
        next,
        action: resolvedAction,
      });
    },
    [controlled, onChange],
  );

  return [resource, setResource] as const;
}

function useLocalRowSequences<T extends Row>(data: T[], enabled: boolean): T[] {
  const [numbered, setNumbered] = useState(() => {
    const rows = enabled ? assignRowSequences(data) : data;
    return { data, enabled, rows, minimum: nextRowSequence(rows) };
  });
  const rows = useMemo(() => {
    if (!enabled) return data;
    if (numbered.data === data && numbered.enabled) return numbered.rows;
    return assignRowSequences(
      reuseRowSequences(data, numbered.rows),
      numbered.minimum,
    );
  }, [data, enabled, numbered]);
  // Retain local numbers for legacy controlled rows across external updates.
  if (
    enabled &&
    rows !== numbered.rows &&
    (rows.length !== numbered.rows.length ||
      rows.some(
        ({ id, sequence }, index) =>
          id !== numbered.rows[index]?.id ||
          sequence !== numbered.rows[index].sequence,
      ))
  ) {
    setNumbered({
      data,
      enabled,
      rows,
      minimum: nextRowSequence(rows, numbered.minimum),
    });
  }
  return rows;
}

export function useTableView<TPlugins extends CellPlugin[]>(
  options: UseTableViewOptions<TPlugins>,
) {
  const [{ getTable, bindTable }] = useState(() => {
    let currentTable: _TableInstance | null = null;
    return {
      getTable: () => currentTable,
      bindTable: (table: _TableInstance) => {
        currentTable = table;
      },
    };
  });
  const {
    plugins,
    weekStartsOn = 1,
    getRowUrl,
    propertySources,
    onDataChange,
    onPropertiesChange,
    onViewChange,
    defaultColumn: defaultColumnOverride,
  } = options;
  const [initialTable] = useState(
    () => createInitialTable() as TableState<TPlugins>,
  );

  const isDataControlled = options.data !== undefined;
  const isPropertiesControlled = options.properties !== undefined;
  const isViewControlled = options.view !== undefined;
  const controlledView = useMemo(
    () => resolveViewState(options.view),
    [options.view],
  );

  const nextSequenceRef = useRef(1);
  const [propertiesResource, setPropertiesResource] = useResourceState<
    ColumnDefs<TPlugins>,
    PropertiesResourceAction
  >({
    name: "properties",
    controlled: isPropertiesControlled,
    value: isPropertiesControlled
      ? options.properties
      : initialTable.properties,
    defaultValue: options.defaultProperties ?? initialTable.properties,
    onChange: onPropertiesChange,
  });
  const [tableGlobalState, setViewResource] = useResourceState<
    TableViewState,
    ViewResourceAction
  >({
    name: "view",
    controlled: isViewControlled,
    value: controlledView,
    defaultValue: resolveViewState(options.defaultView),
    onChange: onViewChange,
    onProposalSettled: ({ authoritative, proposals }) => {
      if (
        proposals.some(({ action }) => action.type === "view.group_sort.change")
      ) {
        getTable()?._settlePendingGroupOrder(
          authoritative.pluginMethods?.groupSort ?? { mode: "manual" },
        );
      }
    },
  });
  const [relativeFilterRefresh, setRelativeFilterRefresh] = useState(0);
  /** columns states */
  const columnEntity = useMemo(
    () => toPropertyEntity(plugins.items, propertiesResource),
    [plugins.items, propertiesResource],
  );
  const hasIdPlugin = Object.hasOwn(plugins.items, "id");
  const allocateRowNumber = propertySources?.allocateRowNumber;
  const [defaultData] = useState(
    () => options.defaultData ?? initialTable.data,
  );
  const inputData = useLocalRowSequences(
    options.data ?? defaultData,
    hasIdPlugin && !allocateRowNumber,
  );
  const [dataResource, setDataResource] = useResourceState<
    Row<TPlugins>[],
    DataResourceAction
  >({
    name: "data",
    controlled: isDataControlled,
    value: inputData,
    defaultValue: inputData,
    onChange: onDataChange,
  });
  const people = propertySources?.people;
  const projectRow = useMemo(
    () =>
      createRowProjector<Row<TPlugins>>(
        Object.values(columnEntity.items),
        people,
      ),
    [columnEntity.items, people],
  );
  const dataEntity = useMemo(
    () => (projectRow ? dataResource.map(projectRow) : dataResource),
    [dataResource, projectRow],
  );
  useLayoutEffect(() => {
    nextSequenceRef.current = nextRowSequence(
      dataResource,
      nextSequenceRef.current,
    );
  }, [dataResource]);
  const handleDataChange = useCallback<
    ResourceChangeFn<Row<TPlugins>[], DataResourceAction>
  >(
    (updater, action) =>
      setDataResource((previous) => {
        const proposed = functionalUpdate(updater, previous);
        if (proposed === previous || !hasIdPlugin) return proposed;
        if (
          proposed.length === previous.length &&
          proposed.every(({ id, sequence }, index) => {
            const row = previous[index];
            return (
              row?.id === id &&
              sequence !== undefined &&
              row.sequence === sequence
            );
          })
        )
          return proposed;
        const prior = assignRowSequences(previous, 1, allocateRowNumber);
        const sequences = new Map(
          prior.map(({ id, sequence }) => [id, sequence]),
        );
        const rows = proposed.map((row) => {
          const sequence = sequences.get(row.id);
          return row.sequence === sequence ? row : { ...row, sequence };
        });
        const minimum = nextRowSequence(prior, nextSequenceRef.current);
        const next = assignRowSequences(rows, minimum, allocateRowNumber);
        nextSequenceRef.current = nextRowSequence(next, minimum);
        return next;
      }, action),
    [allocateRowNumber, hasIdPlugin, setDataResource],
  );
  const columns = useMemo(
    () =>
      columnEntity.ids.map<ColumnDef<TableFeatures, Row<TPlugins>>>((colId) => {
        const property = columnEntity.items[colId]!;
        const plugin = plugins.items[property.type]!;
        return {
          id: property.id,
          enableGlobalFilter:
            !property.isDeleted && (property.type !== "id" || !property.hidden),
          ...(plugin.canGroup === false && { enableGrouping: false }),
          accessorFn: (row) => {
            const cell = row.properties[colId];
            const value: unknown = cell ? cell.value : plugin.default.data;
            const comparable = resolveSortingAccessorValue(
              plugin,
              value,
              row,
              colId,
              tableGlobalState.pluginMethods?.sortingMethodByColumn?.[colId],
              createRuntimePluginMethodContext(
                getTable,
                colId,
                property.config,
                weekStartsOn,
              ),
            );
            return comparable ?? undefined;
          },
          minSize: getMinWidth(property.type),
          sortUndefined: "last",
          sortFn: resolveSortingFn(
            plugin,
            tableGlobalState.pluginMethods?.sortingMethodByColumn?.[colId],
            createRuntimePluginMethodContext(
              getTable,
              colId,
              property.config,
              weekStartsOn,
            ),
          ),
          aggregationFn: createCountingAggregation(plugin),
          getGroupingValue: (row) => {
            const groupingMethod = resolveGroupingMethod(
              plugin,
              tableGlobalState.pluginMethods?.groupingMethodByColumn?.[colId],
            );
            const cell = row.properties[colId];
            const data = (cell ? cell.value : plugin.default.data) as never;
            if (plugin.isEmpty(data)) return null;
            return groupingMethod.function(
              data,
              row,
              colId,
              createRuntimePluginMethodContext(
                getTable,
                colId,
                property.config,
                weekStartsOn,
              ),
            );
          },
        };
      }),
    [
      columnEntity,
      getTable,
      plugins.items,
      tableGlobalState.pluginMethods,
      weekStartsOn,
    ],
  );
  const refreshRelativeFilters = hasRelativeDateFilter(
    tableGlobalState.filters,
    columnEntity.items,
    plugins.items,
  );

  useEffect(() => {
    if (!refreshRelativeFilters) return;
    const delay = 60_000 - (Date.now() % 60_000);
    const timeout = globalThis.setTimeout(
      () => setRelativeFilterRefresh((refresh) => refresh + 1),
      delay,
    );
    return () => globalThis.clearTimeout(timeout);
  }, [refreshRelativeFilters, relativeFilterRefresh]);
  const handleColumnChange = useCallback<
    ResourceChangeFn<Entity<ColumnInfo>, PropertiesResourceAction>
  >(
    (updater, action) => {
      setPropertiesResource(
        (prev) => {
          const entity = toPropertyEntity(plugins.items, prev);
          const next = functionalUpdate(updater, entity);
          if (next === entity) return prev;
          return next.ids.map((id) => next.items[id]!) as ColumnDefs<TPlugins>;
        },
        (previousProperties, nextProperties) => {
          if (typeof action !== "function") return action;
          return action(
            toPropertyEntity(plugins.items, previousProperties),
            toPropertyEntity(plugins.items, nextProperties),
          );
        },
      );
    },
    [plugins.items, setPropertiesResource],
  );

  const tableState = useMemo(
    () => ({
      columnOrder: columnEntity.ids,
      columnsInfo: columnEntity.items,
      columnVisibility: columnEntity.ids.reduce<Record<string, boolean>>(
        (acc, colId) => {
          const info = columnEntity.items[colId];
          acc[colId] = !info?.hidden && !info?.isDeleted;
          return acc;
        },
        {},
      ),
      cellPlugins: plugins.items,
      tableGlobal: tableGlobalState,
      filterEvaluationTick: relativeFilterRefresh,
    }),
    [
      columnEntity.ids,
      columnEntity.items,
      plugins.items,
      relativeFilterRefresh,
      tableGlobalState,
    ],
  );

  /** table instance */
  const tableOptions = useMemo<TableOptions<TableFeatures, Row<TPlugins>>>(
    () => ({
      features: DEFAULT_FEATURES,
      columns,
      data: dataEntity,
      defaultColumn: defaultColumnOverride ?? defaultColumn,
      columnResizeMode: "onChange",
      groupedColumnMode: false,
      autoResetExpanded: false,
      autoResetCellSelection: false,
      enableCellSelection: canSelectDataCell,
      getRowId: (row) => row.id,
      state: tableState,
      onColumnInfoChange: handleColumnChange,
      onTableDataChange: handleDataChange,
      onTableGlobalChange: setViewResource,
      globalFilterFn: "pluginTextIncludes",
      weekStartsOn,
      getRowUrl,
      propertySources,
    }),
    [
      columns,
      dataEntity,
      defaultColumnOverride,
      getRowUrl,
      handleColumnChange,
      handleDataChange,
      propertySources,
      setViewResource,
      tableState,
      weekStartsOn,
    ],
  );
  const table = useTable<TableFeatures, Row<TPlugins>, null>(
    tableOptions,
    () => null,
  );
  // TanStack installs options during render, and callers can read the row model
  // immediately. Bind the same instance for plugin callbacks before returning it.
  bindTable(table as _TableInstance);
  useCellSelectionDomain(table);

  const sortingMethods = tableGlobalState.pluginMethods?.sortingMethodByColumn;
  const previousSortingMethods = useRef(sortingMethods);
  useEffect(() => {
    if (isSameMethodSelection(previousSortingMethods.current, sortingMethods)) {
      return;
    }
    previousSortingMethods.current = sortingMethods;
    table.baseAtoms.sorting.set((sorting) =>
      sorting.length === 0 ? sorting : [...sorting],
    );
  }, [sortingMethods, table]);

  useEffect(() => {
    table._syncGroupingState();
  }, [
    table,
    dataEntity,
    tableGlobalState.pluginMethods?.groupingMethodByColumn,
    tableGlobalState.pluginMethods?.groupSort,
    weekStartsOn,
  ]);
  table.baseAtoms.rowSelection.set((selection) =>
    tableGlobalState.locked
      ? Object.keys(selection).length === 0
        ? selection
        : {}
      : pruneRowSelection(selection, dataEntity),
  );

  return useMemo(() => ({ table }), [table]);
}
