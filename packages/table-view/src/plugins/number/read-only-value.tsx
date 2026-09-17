import { z } from "zod";

import { COLOR, type Color } from "@notion-kit/utils";

import type { ReadOnlyValueProps } from "../registry";
import { NumberCellValue } from "./number-cell";

const snapshotSchema = z.object({
  value: z
    .string()
    .refine((value) => value.trim() !== "" && Number.isFinite(Number(value)))
    .nullable(),
  config: z.object({
    format: z.enum(["number", "number_with_commas", "percent", "currency"]),
    round: z.enum(["default", "0", "1", "2", "3", "4", "5"]),
    showAs: z.enum(["number", "bar", "ring"]),
    options: z.object({
      color: z.enum(Object.keys(COLOR) as Color[]),
      divideBy: z.number().positive(),
      showNumber: z.boolean().optional(),
    }),
  }),
});

export function ReadOnlyNumberValue({
  value,
  config,
  textValue,
}: ReadOnlyValueProps) {
  const parsed = snapshotSchema.safeParse({ value, config });
  if (!parsed.success) return textValue;
  if (parsed.data.value === null)
    return <span className="text-muted">Empty</span>;
  return (
    <NumberCellValue
      data={parsed.data.value}
      config={parsed.data.config}
      wrapped
    />
  );
}
