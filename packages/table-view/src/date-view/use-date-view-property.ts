import { useEffect, useRef } from "react";
import { v4 } from "uuid";

import type { ColumnInfo, Row, TableViewState } from "@notion-kit/table-hook";

import { useTableViewCtx } from "@/table-contexts";

import { resolveDateProperty } from "./date-property";

export interface DateViewResources {
  columnOrder: string[];
  columnsInfo: Record<string, ColumnInfo>;
  locked: boolean;
  dateView: NonNullable<TableViewState["dateView"]>;
}

export type DateViewResolution =
  | { status: "ready"; property: ColumnInfo }
  | { status: "pending"; property: null }
  | { status: "locked-empty"; property: null };

export function useDateViewProperty(
  resources: DateViewResources,
  initialization: { name: string; getInitialValue?: (row: Row) => unknown },
): DateViewResolution {
  const { table } = useTableViewCtx();
  const pendingRef = useRef(false);
  const properties = resources.columnOrder.flatMap((id) =>
    resources.columnsInfo[id] ? [resources.columnsInfo[id]] : [],
  );
  const resolvedProperty = resolveDateProperty(
    properties,
    resources.dateView.datePropertyId,
  );
  const persistedProperty =
    resolvedProperty?.id === resources.dateView.datePropertyId
      ? resolvedProperty
      : null;

  useEffect(() => {
    if (persistedProperty) {
      pendingRef.current = false;
      return;
    }
    if (resources.locked || pendingRef.current) return;
    pendingRef.current = true;
    const operationId = v4();
    if (resolvedProperty) {
      table.setDateViewDateProperty(resolvedProperty.id, operationId);
      return;
    }
    const propertyId = v4();
    table.addColumnInfo({
      id: propertyId,
      name: table.generateUniqueColumnName(initialization.name),
      type: "date",
      operationId,
      getInitialValue: initialization.getInitialValue,
    });
    table.setDateViewDateProperty(propertyId, operationId);
  }, [
    persistedProperty,
    resolvedProperty,
    resources.locked,
    table,
    initialization,
  ]);

  if (persistedProperty)
    return { status: "ready", property: persistedProperty };
  if (resources.locked && resolvedProperty)
    return { status: "ready", property: resolvedProperty };
  return {
    status: resources.locked ? "locked-empty" : "pending",
    property: null,
  };
}
