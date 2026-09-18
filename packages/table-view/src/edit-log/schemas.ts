import { z } from "zod";

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

export const tableEditLogSchema = z.object({
  id: identifier,
  editedAt: timestamp,
  action: identifier,
  target: z.object({ id: identifier.optional(), name: z.string() }),
  property: property.optional(),
  summary: z.string(),
});

export const rowEditLogSchema = z.object({
  id: identifier,
  editedAt: timestamp,
  rowId: identifier,
  property,
  value: z
    .unknown()
    .refine((value) => value !== undefined, "A historical value is required"),
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
