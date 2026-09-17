import { z } from "zod";

import type { ReadOnlyValueProps } from "../registry";
import { DateCell } from "./date-cell/date-cell";
import { DatePickerCellValue } from "./date-cell/date-picker-cell";

const timestampSchema = z
  .number()
  .int()
  .min(-8_640_000_000_000_000)
  .max(8_640_000_000_000_000);
const dateValueSchema = z
  .object({
    start: timestampSchema.optional(),
    end: timestampSchema.optional(),
    endDate: z.boolean().optional(),
    includeTime: z.boolean().optional(),
  })
  .refine((value) => value.end === undefined || value.start !== undefined);
const configSchema = z.object({
  dateFormat: z.enum([
    "full",
    "short",
    "MM/dd/yyyy",
    "dd/MM/yyyy",
    "yyyy/MM/dd",
    "relative",
    "_edit_mode",
  ]),
  timeFormat: z.enum(["hidden", "12-hour", "24-hour", "_edit_mode"]),
  tz: z
    .string()
    .refine((timeZone) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone });
        return true;
      } catch {
        return false;
      }
    })
    .optional(),
});

export function ReadOnlyDateValue({
  value,
  config,
  property,
  textValue,
}: ReadOnlyValueProps) {
  const parsedConfig = configSchema.safeParse(config);
  if (!parsedConfig.success) return textValue;
  if (property.type !== "date") {
    const parsed = timestampSchema.safeParse(value);
    if (!parsed.success) return textValue;
    return (
      <DateCell
        data={{ start: parsed.data, includeTime: true }}
        config={parsedConfig.data}
        wrapped
      />
    );
  }
  const parsed = dateValueSchema.safeParse(value);
  if (!parsed.success) return textValue;
  if (parsed.data.start === undefined)
    return <span className="text-muted">Empty</span>;
  return (
    <DatePickerCellValue
      data={parsed.data}
      config={parsedConfig.data}
      wrapped
    />
  );
}
