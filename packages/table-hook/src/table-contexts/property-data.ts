import type { ColumnInfo, Row } from "@/lib/types";
import type { CellPlugin } from "@/plugins";
import type { IdConfig } from "@/plugins/id";
import type {
  RelatedDatabase,
  TablePropertySources,
} from "@/plugins/property-sources";
import { readReferences, type PropertyReference } from "@/plugins/references";
import type { RelationConfig } from "@/plugins/relation";
import { calculateRollup, type RollupConfig } from "@/plugins/rollup";

export function getLocalDatabaseId(sources?: TablePropertySources) {
  return sources?.databaseId ?? "self";
}

export function getLocalDatabase(
  sources: TablePropertySources | undefined,
  properties: readonly ColumnInfo[],
  rows: readonly Row[],
  getRowUrl?: (rowId: string) => string,
): RelatedDatabase {
  return {
    id: getLocalDatabaseId(sources),
    name: sources?.databaseName ?? "This table",
    properties: [...properties],
    rows,
    getRowUrl,
  };
}

export function getRelatedDatabase(
  databaseId: string,
  local: RelatedDatabase,
  sources?: TablePropertySources,
) {
  return databaseId === local.id
    ? local
    : sources?.databases?.find((database) => database.id === databaseId);
}

export function getRollupTarget(
  config: RollupConfig,
  local: RelatedDatabase,
  sources?: TablePropertySources,
):
  | {
      relation: RelatedDatabase["properties"][number];
      database: RelatedDatabase;
      property: RelatedDatabase["properties"][number];
    }
  | undefined {
  const relation = local.properties.find(
    ({ id, type, isDeleted }) =>
      id === config.relationPropertyId && type === "relation" && !isDeleted,
  );
  if (!relation) return undefined;
  const { databaseId } = relation.config as RelationConfig;
  const database = getRelatedDatabase(databaseId, local, sources);
  const property = database?.properties.find(
    ({ id, type, isDeleted }) =>
      id === config.targetPropertyId && type !== "rollup" && !isDeleted,
  );
  if (!database || !property) return undefined;
  return { relation, database, property };
}

export function getRelatedRowOptions(
  database: RelatedDatabase,
): PropertyReference[] {
  const title = database.properties.find(
    ({ type, isDeleted }) => type === "title" && !isDeleted,
  );
  return database.rows.map(({ id, properties }) => {
    const name: unknown = title && properties[title.id]?.value;
    return {
      id,
      name: (typeof name === "string" && name.trim()) || "Untitled",
      href: database.getRowUrl?.(id),
    };
  });
}

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
  "relation",
  "rollup",
]);

export function hasProjectedPropertyValue(type: string) {
  return projectedTypes.has(type);
}

interface PropertyProjectionOptions {
  propertyId?: string;
  getRowUrl?: (rowId: string) => string;
}

export function projectTableData<T extends Row>(
  rows: T[],
  columns: Record<string, ColumnInfo>,
  plugins: Record<string, CellPlugin>,
  sources?: TablePropertySources,
  { propertyId, getRowUrl }: PropertyProjectionOptions = {},
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
  const local = getLocalDatabase(
    sources,
    allProperties,
    numberedRows,
    getRowUrl,
  );
  const people = new Map(sources?.people?.map((person) => [person.id, person]));
  const relatedRows = new Map<
    RelatedDatabase,
    Map<string, PropertyReference>
  >();
  const rowsByDatabase = new Map<RelatedDatabase, Map<string, Row>>();
  const getRows = (database: RelatedDatabase) => {
    const existing = rowsByDatabase.get(database);
    if (existing) return existing;
    const rows = new Map(database.rows.map((row) => [row.id, row]));
    rowsByDatabase.set(database, rows);
    return rows;
  };
  const resolve = (
    references: PropertyReference[],
    options: Map<string, PropertyReference>,
  ) => references.map((reference) => options.get(reference.id) ?? reference);
  function projectRollup(
    row: Row,
    config: RollupConfig,
    databaseScope: RelatedDatabase,
  ) {
    const rollupTarget = getRollupTarget(config, databaseScope, sources);
    if (!rollupTarget) return null;
    const { relation, database, property } = rollupTarget;
    const plugin = plugins[property.type];
    if (!plugin) return null;
    const selected = readReferences(row.properties[relation.id]?.value);
    const rowsById = getRows(database);
    const targetProperty: ColumnInfo = {
      ...property,
      config: property.config ?? plugin.default.config,
    };
    const related = selected.flatMap(({ id }) => {
      const relatedRow = rowsById.get(id);
      if (!relatedRow) return [];
      if (!projectedTypes.has(property.type)) return [relatedRow];
      return [
        {
          ...relatedRow,
          properties: {
            ...relatedRow.properties,
            [property.id]: {
              id: property.id,
              value: project(relatedRow, targetProperty, database),
            },
          },
        },
      ];
    });
    return calculateRollup(config, targetProperty, plugin, related);
  }

  function project(
    row: Row,
    property: ColumnInfo,
    databaseScope = local,
  ): unknown {
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
      case "relation": {
        const { databaseId } = property.config as RelationConfig;
        const references = readReferences(data);
        if (!references.length) return references;
        const database = getRelatedDatabase(databaseId, databaseScope, sources);
        if (!database) return references;
        let options = relatedRows.get(database);
        if (!options) {
          options = new Map(
            getRelatedRowOptions(database).map((option) => [option.id, option]),
          );
          relatedRows.set(database, options);
        }
        return resolve(references, options);
      }
      case "rollup":
        return projectRollup(
          row,
          property.config as RollupConfig,
          databaseScope,
        );
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
