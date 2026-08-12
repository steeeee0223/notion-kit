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
} from "@tanstack/react-table";

import {
  createPluginMethodState,
  DEFAULT_FEATURES,
  type TableFeatures,
} from "@/features";
import type { TableViewState } from "@/features/menu";
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
import type { CellPlugin } from "@/plugins";
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
  timeline: {
    range: "monthly",
    datePropertyId: null,
  },
} satisfies TableViewState;

function resolveViewState(view?: PartialTableViewState): TableViewState {
  const pluginMethods = createPluginMethodState();
  return {
    ...DEFAULT_VIEW_STATE,
    ...view,
    timeline: { ...DEFAULT_VIEW_STATE.timeline, ...view?.timeline },
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

export function useTableView<TPlugins extends CellPlugin[]>(
  options: UseTableViewOptions<TPlugins>,
) {
  const tableRef = useRef<_TableInstance | null>(null);
  const {
    plugins,
    weekStartsOn = 1,
    getRowUrl,
    onDataChange,
    onPropertiesChange,
    onViewChange,
    defaultColumn: defaultColumnOverride,
  } = options;
  const initialTable = useRef<TableState<TPlugins> | null>(null);
  initialTable.current ??= createInitialTable() as TableState<TPlugins>;

  const isDataControlled = options.data !== undefined;
  const isPropertiesControlled = options.properties !== undefined;
  const isViewControlled = options.view !== undefined;
  const controlledView = useMemo(
    () => resolveViewState(options.view),
    [options.view],
  );

  const [dataEntity, setDataResource] = useResourceState<
    Row<TPlugins>[],
    DataResourceAction
  >({
    name: "data",
    controlled: isDataControlled,
    value: isDataControlled ? options.data : initialTable.current.data,
    defaultValue: options.defaultData ?? initialTable.current.data,
    onChange: onDataChange,
  });
  const [propertiesResource, setPropertiesResource] = useResourceState<
    ColumnDefs<TPlugins>,
    PropertiesResourceAction
  >({
    name: "properties",
    controlled: isPropertiesControlled,
    value: isPropertiesControlled
      ? options.properties
      : initialTable.current.properties,
    defaultValue: options.defaultProperties ?? initialTable.current.properties,
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
        tableRef.current?._settlePendingGroupedRowDrag(
          authoritative.pluginMethods?.groupSort ?? { mode: "manual" },
        );
      }
    },
  });
  /** columns states */
  const columnEntity = useMemo(
    () => toPropertyEntity(plugins.items, propertiesResource),
    [plugins.items, propertiesResource],
  );
  const columns = useMemo(
    () =>
      columnEntity.ids.map<ColumnDef<TableFeatures, Row<TPlugins>>>((colId) => {
        const property = columnEntity.items[colId]!;
        const plugin = plugins.items[property.type]!;
        return {
          id: property.id,
          accessorFn: (row) => {
            const value: unknown = row.properties[colId]?.value;
            const comparable = resolveSortingAccessorValue(
              plugin,
              value,
              row,
              colId,
              tableGlobalState.pluginMethods?.sortingMethodByColumn?.[colId],
              createRuntimePluginMethodContext(
                () => tableRef.current,
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
              () => tableRef.current,
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
            return groupingMethod.function(
              row.properties[colId]?.value,
              row,
              colId,
              createRuntimePluginMethodContext(
                () => tableRef.current,
                colId,
                property.config,
                weekStartsOn,
              ),
            );
          },
        };
      }),
    [columnEntity, plugins.items, tableGlobalState.pluginMethods, weekStartsOn],
  );
  const handleColumnChange = useCallback<
    ResourceChangeFn<Entity<ColumnInfo>, PropertiesResourceAction>
  >(
    (updater, action) => {
      setPropertiesResource(
        (prev) => {
          const entity = toPropertyEntity(plugins.items, prev);
          const next = functionalUpdate(updater, entity);
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
    }),
    [columnEntity.ids, columnEntity.items, plugins.items, tableGlobalState],
  );

  /** table instance */
  const table = useTable<TableFeatures, Row<TPlugins>, null>(
    {
      features: DEFAULT_FEATURES,
      columns,
      data: dataEntity,
      defaultColumn: defaultColumnOverride ?? defaultColumn,
      columnResizeMode: "onChange",
      groupedColumnMode: false,
      autoResetExpanded: false,
      getRowId: (row) => row.id,
      state: tableState,
      onColumnInfoChange: handleColumnChange,
      onTableDataChange: setDataResource,
      onTableGlobalChange: setViewResource,
      weekStartsOn,
      getRowUrl,
    },
    () => null,
  );
  tableRef.current = table as _TableInstance;

  const sortingMethods = tableGlobalState.pluginMethods?.sortingMethodByColumn;
  const previousSortingMethods = useRef(sortingMethods);
  useEffect(() => {
    if (isSameMethodSelection(previousSortingMethods.current, sortingMethods)) {
      return;
    }
    previousSortingMethods.current = sortingMethods;
    table.setSorting((sorting) =>
      sorting.length === 0 ? sorting : [...sorting],
    );
  }, [sortingMethods, table]);

  useEffect(() => {
    table._syncGroupingState();
  }, [
    table,
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
