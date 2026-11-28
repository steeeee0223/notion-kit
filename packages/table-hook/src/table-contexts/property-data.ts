import type { ColumnInfo, Row } from "@/lib/types";
import type { IdConfig } from "@/plugins/id";
import type { TablePropertySources } from "@/plugins/property-sources";
import { readReferences, type PropertyReference } from "@/plugins/references";

export function nextRowSequence(rows: readonly Row[], minimum = 1) {
  return rows.reduce(
    (next, { sequence }) =>
      sequence && sequence >= next ? sequence + 1 : next,
    minimum,
  );
}

export function assignRowSequences<T extends Row>(
  rows: T[],
  minimum = 1,
  allocate?: TablePropertySources["allocateRowNumber"],
): T[] {
  if (rows.every(({ sequence }) => sequence !== undefined)) return rows;
  let next = nextRowSequence(rows, minimum);
  const sequences = new Map<string, number>();
  const allocated = new Set(rows.map(({ sequence }) => sequence));
  for (const row of rows
    .filter(({ sequence }) => sequence === undefined)
    .sort((a, b) => a.createdAt - b.createdAt)) {
    const sequence = allocate?.(row.id, next) ?? next;
    if (
      !Number.isSafeInteger(sequence) ||
      sequence < 1 ||
      allocated.has(sequence)
    )
      throw new Error("Invalid row sequence returned by the allocator");
    sequences.set(row.id, sequence);
    allocated.add(sequence);
    next = Math.max(next, sequence + 1);
  }
  return rows.map((row) =>
    row.sequence === undefined
      ? { ...row, sequence: sequences.get(row.id) }
      : row,
  );
}

const projectedTypes = new Set([
  "id",
  "person",
  "created-by",
  "last-edited-by",
  "location",
]);

export function hasProjectedPropertyValue(type: string) {
  return projectedTypes.has(type);
}

interface PropertyProjectionOptions {
  propertyId?: string;
}

export function projectTableData<T extends Row>(
  rows: T[],
  columns: Record<string, ColumnInfo>,
  sources?: TablePropertySources,
  { propertyId }: PropertyProjectionOptions = {},
): T[] {
  const allProperties = Object.values(columns);
  const projectedProperties = allProperties.filter(
    ({ type, isDeleted }) => !isDeleted && projectedTypes.has(type),
  );
  const properties =
    propertyId === undefined
      ? projectedProperties
      : projectedProperties.filter(({ id }) => id === propertyId);
  if (!properties.length) return rows;
  const numberedRows =
    !sources?.allocateRowNumber &&
    projectedProperties.some(({ type }) => type === "id")
      ? assignRowSequences(rows)
      : rows;
  const people = new Map(sources?.people?.map((person) => [person.id, person]));
  const resolve = (
    references: PropertyReference[],
    options: Map<string, PropertyReference>,
  ) => references.map((reference) => options.get(reference.id) ?? reference);
  function project(row: Row, property: ColumnInfo): unknown {
    const data: unknown = row.properties[property.id]?.value;
    switch (property.type) {
      case "id": {
        const { prefix } = property.config as IdConfig;
        return row.sequence ? { number: row.sequence, prefix } : null;
      }
      case "person":
        return resolve(readReferences(data), people);
      case "created-by":
        return row.createdBy ? resolve([row.createdBy], people) : [];
      case "last-edited-by":
        return row.lastEditedBy ? resolve([row.lastEditedBy], people) : [];
      case "location":
        return data ?? null;
      default:
        return data;
    }
  }
  return numberedRows.map((row) => {
    const cells = { ...row.properties };
    for (const property of properties) {
      cells[property.id] = {
        id: row.properties[property.id]?.id ?? `${row.id}:${property.id}`,
        value: project(row, property),
      };
    }
    return { ...row, properties: cells };
  });
}
