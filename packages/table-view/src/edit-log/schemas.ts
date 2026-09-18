import { z } from "zod";

import { LAYOUT_OPTIONS } from "@notion-kit/table-hook";

import { tableEditLogActions } from "./messages";

const identifier = z.string().min(1);
const timestamp = z
  .number()
  .int()
  .min(-8_640_000_000_000_000)
  .max(8_640_000_000_000_000);
const icon = z.object({
  type: z.enum(["emoji", "url", "text", "lucide"]),
  src: z.string(),
  color: z.string().optional(),
});
const property = z.object({
  id: identifier,
  name: z.string(),
  icon: icon.nullable().optional(),
  type: identifier,
  config: z.unknown().optional(),
});
const historicalValue = z
  .unknown()
  .refine((value) => value !== undefined, "A historical value is required");

export const tableEditLogSchema = z
  .object({
    id: identifier,
    editedAt: timestamp,
    action: z.enum(tableEditLogActions),
    target: z.object({ id: identifier.optional(), name: z.string() }),
    property: property.optional(),
    cell: z
      .object({ property, value: historicalValue, textValue: z.string() })
      .optional(),
    groupBy: property.optional(),
    layout: z.enum(LAYOUT_OPTIONS.map((layout) => layout.value)).optional(),
  })
  .refine(
    (record) => (record.action === "update") === (record.cell !== undefined),
    "Cell snapshots are required for update actions and excluded from other actions",
  )
  .refine(
    (record) =>
      record.action !== "change-type" || record.property !== undefined,
    "Type changes require a historical property",
  )
  .refine(
    (record) =>
      record.action !== "change-layout" || record.layout !== undefined,
    "Layout changes require the destination layout",
  );

export const rowEditLogSchema = z.object({
  id: identifier,
  editedAt: timestamp,
  rowId: identifier,
  property,
  value: historicalValue,
  textValue: z.string(),
});

export const tableEditLogPageSchema = z.object({
  items: z.array(tableEditLogSchema),
  nextCursor: identifier.nullable(),
});

export const rowEditLogPageSchema = (rowId: string) =>
  z.object({
    items: z.array(
      rowEditLogSchema.refine(
        (record) => record.rowId === rowId,
        "Unexpected row history",
      ),
    ),
    nextCursor: identifier.nullable(),
  });
