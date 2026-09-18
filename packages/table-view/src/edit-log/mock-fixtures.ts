import { z } from "zod";

import type { ColumnDefs, Row } from "@notion-kit/table-hook";

import type { RowEditLog, TableEditLog } from "./types";

const sampleTime = Date.UTC(2026, 8, 17, 12);
const actions = [
  "create",
  "rename",
  "duplicate",
  "delete",
  "restore",
  "hide",
  "show",
  "move",
  "resize",
  "update-config",
  "change-type",
  "change-layout",
  "create",
  "update-config",
  "hide",
  "rename",
] as const;

const primitiveText = z.union([z.string(), z.number(), z.boolean()]);
const textList = z.array(z.string());
const dateValue = z.object({
  start: z.number().finite().optional(),
  end: z.number().finite().optional(),
});

function textValue(value: unknown, type: string): string {
  if (value === null || value === undefined || value === "") return "Empty";
  const primitive = primitiveText.safeParse(value);
  if (primitive.success) return String(primitive.data);
  const list = textList.safeParse(value);
  if (list.success) return list.data.join(", ") || "Empty";
  const date = dateValue.safeParse(value);
  if (type === "date" && date.success) {
    if (date.data.start === undefined) return "Empty";
    const start = new Date(date.data.start);
    if (Number.isNaN(start.valueOf())) return "Invalid date";
    const end = date.data.end === undefined ? null : new Date(date.data.end);
    return (
      start.toISOString() +
      (end && !Number.isNaN(end.valueOf()) ? ` → ${end.toISOString()}` : "")
    );
  }
  return JSON.stringify(value);
}

/** These illustrative snapshots are built once, without observing future edits. */
export function createMockEditLogFixtures(data: Row[], properties: ColumnDefs) {
  const table: TableEditLog[] = (properties.length ? actions : []).map(
    (action, index) => {
      const property = properties[index % properties.length]!;
      return {
        id: `sample-table-${index}`,
        editedAt: sampleTime - index * 60_000,
        action,
        target:
          action === "change-layout"
            ? { name: "View" }
            : { id: property.id, name: property.name },
        layout: action === "change-layout" ? "board" : undefined,
        property: ![
          "create",
          "duplicate",
          "delete",
          "restore",
          "change-layout",
        ].includes(action)
          ? {
              id: property.id,
              name: property.name,
              type: property.type,
              icon: property.icon,
            }
          : undefined,
      };
    },
  );
  const rows = new Map<string, RowEditLog[]>();
  for (const row of data) {
    const records =
      properties.length === 0
        ? []
        : Array.from(
            { length: Math.max(16, properties.length) },
            (_, index): RowEditLog => {
              const property = properties[index % properties.length]!;
              const value: unknown =
                property.type === "created-time"
                  ? row.createdAt
                  : property.type === "last-edited-time"
                    ? row.lastEditedAt
                    : (row.properties[property.id]?.value ?? null);
              return {
                id: `sample-row-${row.id}-${index}`,
                editedAt: sampleTime - index * 60_000,
                rowId: row.id,
                property: {
                  id: property.id,
                  name: property.name,
                  icon: property.icon,
                  type: property.type,
                  config: property.config as unknown,
                },
                value,
                textValue: textValue(value, property.type),
              };
            },
          );
    rows.set(row.id, records);
  }
  return { table, rows };
}
