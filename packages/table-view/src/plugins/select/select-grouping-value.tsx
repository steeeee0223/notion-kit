import { cn } from "@notion-kit/cn";
import { TooltipPreset } from "@notion-kit/shadcn";

import { OptionTag } from "../../common";
import { ColumnInfo } from "../../lib/types";
import type { GroupingValueProps } from "../types";
import { DefaultGroupingValue } from "../utils";
import { MultiSelectPlugin, SelectPlugin } from "./types";

export function SelectGroupingValue({
  value,
  table,
  className,
}: GroupingValueProps) {
  if (!value) return <DefaultGroupingValue value="" table={table} />;

  const name = (value as string).split(",")[0];
  if (name === undefined) return null;

  const column = table.getGroupedColumnInfo() as ColumnInfo<
    SelectPlugin | MultiSelectPlugin
  >;
  const tag = column.config.options.items[name];

  if (!tag) {
    console.error(
      `[SelectGroupingValue] tag not found for grouping value: ${name}`,
    );
    return null;
  }
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 truncate font-medium",
        className,
      )}
    >
      <TooltipPreset
        key={tag.id}
        description={
          tag.description
            ? [
                { type: "default", text: tag.name },
                { type: "secondary", text: tag.description },
              ]
            : tag.name
        }
        side="top"
        asChild={false}
      >
        <OptionTag {...tag} />
      </TooltipPreset>
    </div>
  );
}
