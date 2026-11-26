import { v4 } from "uuid";

import type { ColumnInfo, Row } from "@/lib/types";
import type { RelationChange } from "@/plugins/property-sources";
import { readReferences } from "@/plugins/references";
import type { RelationConfig } from "@/plugins/relation";

export function getRelationChanges(
  previous: readonly Row[],
  next: readonly Row[],
  columns: Record<string, ColumnInfo>,
  sourceDatabaseId: string,
): RelationChange[] {
  const relations = Object.values(columns).flatMap((property) => {
    if (property.type !== "relation" || property.isDeleted) return [];
    const config = property.config as RelationConfig;
    return config.reciprocalPropertyId
      ? [
          {
            property,
            config,
            reciprocalPropertyId: config.reciprocalPropertyId,
          },
        ]
      : [];
  });
  if (!relations.length) return [];
  const before = new Map(previous.map((row) => [row.id, row]));
  const after = new Map(next.map((row) => [row.id, row]));
  const changes: RelationChange[] = [];
  for (const sourceRowId of new Set([...before.keys(), ...after.keys()])) {
    const oldRow = before.get(sourceRowId);
    const newRow = after.get(sourceRowId);
    if (oldRow === newRow) continue;
    for (const { property, config, reciprocalPropertyId } of relations) {
      const oldValue: unknown = oldRow?.properties[property.id]?.value;
      const newValue: unknown = newRow?.properties[property.id]?.value;
      if (oldValue === newValue) continue;
      const previousRowIds = readReferences(oldValue).map(({ id }) => id);
      const nextRowIds = readReferences(newValue).map(({ id }) => id);
      if (
        previousRowIds.length === nextRowIds.length &&
        previousRowIds.every((id) => nextRowIds.includes(id))
      )
        continue;
      changes.push({
        sourceDatabaseId,
        sourcePropertyId: property.id,
        sourceRowId,
        targetDatabaseId: config.databaseId,
        targetPropertyId: reciprocalPropertyId,
        previousRowIds,
        nextRowIds,
      });
    }
  }
  return changes;
}

/** Apply a source relation change to the target database. Safe to apply again after a retry. */
export function applyRelationChanges<T extends Row>(
  rows: T[],
  changes: readonly RelationChange[],
): T[] {
  let result = rows;
  for (const change of changes) {
    result = result.map((row) => {
      const wasLinked = change.previousRowIds.includes(row.id);
      const isLinked = change.nextRowIds.includes(row.id);
      if (wasLinked === isLinked) return row;
      const existing = row.properties[change.targetPropertyId];
      const references = readReferences(existing?.value);
      const alreadyLinked = references.some(
        ({ id }) => id === change.sourceRowId,
      );
      if (alreadyLinked === isLinked) return row;
      const value = isLinked
        ? [...references, { id: change.sourceRowId, name: "" }]
        : references.filter(({ id }) => id !== change.sourceRowId);
      return {
        ...row,
        properties: {
          ...row.properties,
          [change.targetPropertyId]: { id: existing?.id ?? v4(), value },
        },
      };
    });
  }
  return result;
}
