import { useEffect, useRef } from "react";
import { v4 } from "uuid";

import type { ColumnInfo, TableViewState } from "@notion-kit/table-hook";

import { useTableViewCtx } from "@/table-contexts";

import {
  createInitialTimelineDate,
  resolveTimelineDateProperty,
} from "./timeline-adapter";

export interface TimelineViewResources {
  columnOrder: string[];
  columnsInfo: Record<string, ColumnInfo>;
  locked: boolean;
  timeline: NonNullable<TableViewState["timeline"]>;
}

export type TimelineViewResolution =
  | { status: "ready"; property: ColumnInfo }
  | { status: "pending"; property: null }
  | { status: "locked-empty"; property: null };

export function useTimelineViewState(
  resources: TimelineViewResources,
): TimelineViewResolution {
  const { table } = useTableViewCtx();
  const pendingRef = useRef(false);
  const properties = resources.columnOrder.flatMap((id) => {
    const property = resources.columnsInfo[id];
    return property ? [property] : [];
  });
  const persistedProperty = resolveTimelineDateProperty(
    properties.filter(
      (property) => property.id === resources.timeline.datePropertyId,
    ),
    resources.timeline.datePropertyId,
  );
  const resolvedProperty = resolveTimelineDateProperty(
    properties,
    resources.timeline.datePropertyId,
  );

  useEffect(() => {
    if (persistedProperty) {
      pendingRef.current = false;
      return;
    }
    if (resources.locked || pendingRef.current) return;

    const operationId = v4();
    if (resolvedProperty) {
      pendingRef.current = true;
      table.setTimelineDateProperty(resolvedProperty.id, operationId);
      return;
    }

    const propertyId = v4();
    pendingRef.current = true;
    table.addColumnInfo({
      id: propertyId,
      name: table.generateUniqueColumnName("Timeline"),
      type: "date",
      operationId,
      getInitialValue: createInitialTimelineDate,
    });
    table.setTimelineDateProperty(propertyId, operationId);
  }, [persistedProperty, resolvedProperty, resources.locked, table]);

  if (persistedProperty) {
    return { status: "ready", property: persistedProperty };
  }
  if (resources.locked && resolvedProperty) {
    return { status: "ready", property: resolvedProperty };
  }
  if (resources.locked) {
    return { status: "locked-empty", property: null };
  }
  return { status: "pending", property: null };
}
