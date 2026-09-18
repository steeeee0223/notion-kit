import { z } from "zod";

import { COLOR, type Color } from "@notion-kit/utils";

import type { ReadOnlyValueProps } from "../registry";
import { SelectCellValue } from "./select-cell";

const configSchema = z.object({
  options: z.object({
    names: z.array(z.string()),
    items: z.record(
      z.string(),
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.enum(Object.keys(COLOR) as Color[]),
        description: z.string().optional(),
      }),
    ),
  }),
  sort: z.enum(["manual", "alphabetical", "reverse-alphabetical"]),
});
const singleValueSchema = z.string().nullable();
const multipleValueSchema = z.array(z.string());

export function ReadOnlySelectValue({
  value,
  config,
  property,
  textValue,
}: ReadOnlyValueProps) {
  const parsedConfig = configSchema.safeParse(config);
  const parsedValue =
    property.type === "multi-select"
      ? multipleValueSchema.safeParse(value)
      : singleValueSchema.safeParse(value);
  if (!parsedConfig.success || !parsedValue.success) return textValue;
  const data =
    typeof parsedValue.data === "string"
      ? parsedValue.data
        ? [parsedValue.data]
        : []
      : (parsedValue.data ?? []);
  if (data.length === 0) return <span className="text-muted">Empty</span>;
  if (
    data.some((name) => !Object.hasOwn(parsedConfig.data.options.items, name))
  )
    return textValue;
  return <SelectCellValue data={data} config={parsedConfig.data} wrapped />;
}
