import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  functionalUpdate,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { DEFAULT_FEATURES, type TableFeatures } from "@/features";
import type { TableViewState } from "@/features/menu";
import type { ColumnDefs, ColumnInfo, Row } from "@/lib/types";
import { type Entity } from "@/lib/utils";
import { resolveGroupingMethod, resolveSortingMethod } from "@/methods";
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
import type { BaseTableProps, TableState } from "@/table-contexts/types";
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
} satisfies TableViewState;

function resolveViewState(view: Partial<TableViewState> | undefined) {
  return {
    ...DEFAULT_VIEW_STATE,
    ...view,
  };
}

function getResourceMode(isControlled: boolean) {
  return isControlled ? "controlled" : "uncontrolled";
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
}: {
  name: string;
  controlled: boolean;
  value: TResource;
  defaultValue: TResource;
  onChange: ResourceChangeHandler<TResource, TAction> | undefined;
}) {
  useOwnershipSwitchWarning(name, controlled);

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const resource = controlled ? value : uncontrolledValue;
  const lastResourceRef = useRef(resource);
  const pendingResourceRef = useRef(resource);

  useEffect(() => {
    if (lastResourceRef.current !== resource) {
      lastResourceRef.current = resource;
      pendingResourceRef.current = resource;
    }
  }, [resource]);

  const setResource = useCallback<ResourceChangeFn<TResource, TAction>>(
    (updater, action) => {
      if (lastResourceRef.current !== resource) {
        lastResourceRef.current = resource;
        pendingResourceRef.current = resource;
      }
      const previous = pendingResourceRef.current;
      const next = functionalUpdate(updater, previous);
      if (Object.is(previous, next)) return;
      pendingResourceRef.current = next;
      if (!controlled) {
        setUncontrolledValue(next);
      }
      onChange?.({
        next,
        action:
          typeof action === "function"
            ? (action as ResourceActionFactory<TResource, TAction>)(
                previous,
                next,
              )
            : action,
      });
    },
    [controlled, onChange, resource],
  );

  return [resource, setResource] as const;
}

export function useTableView<TPlugins extends CellPlugin[]>(
  options: UseTableViewOptions<TPlugins>,
) {
  const {
    plugins,
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
  const viewLocked = options.view?.locked ?? DEFAULT_VIEW_STATE.locked;
  const viewLayout = options.view?.layout ?? DEFAULT_VIEW_STATE.layout;
  const viewRowView = options.view?.rowView ?? DEFAULT_VIEW_STATE.rowView;
  const viewOpenedRowId =
    options.view?.openedRowId ?? DEFAULT_VIEW_STATE.openedRowId;
  const controlledView = useMemo(
    () => ({
      locked: viewLocked,
      layout: viewLayout,
      rowView: viewRowView,
      openedRowId: viewOpenedRowId,
    }),
    [viewLayout, viewLocked, viewOpenedRowId, viewRowView],
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
            return value === null ? undefined : value;
          },
          minSize: getMinWidth(property.type),
          sortUndefined: "last",
          sortFn: (rowA, rowB, colId) =>
            resolveSortingMethod(plugin)?.function(
              rowA.original,
              rowB.original,
              colId,
            ) ?? 0,
          getGroupingValue: (row) => {
            const groupingMethod = resolveGroupingMethod(plugin);
            return groupingMethod.function(
              row.properties[colId]?.value,
              row,
              colId,
            );
          },
        };
      }),
    [columnEntity, plugins.items],
  );
  const handleColumnChange = useCallback<
    ResourceChangeFn<Entity<ColumnInfo>, PropertiesResourceAction>
  >(
    (updater, action) => {
      setPropertiesResource(
        (prev: ColumnDefs<TPlugins>) => {
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
      getRowUrl,
    },
    () => null,
  );

  const resourceVersion = useMemo(
    () => ({}),
    [dataEntity, propertiesResource, tableGlobalState],
  );

  return useMemo(
    () => ({
      table,
      resourceVersion,
    }),
    [resourceVersion, table],
  );
}
