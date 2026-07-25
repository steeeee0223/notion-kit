import { cn } from "@notion-kit/cn";
import { ColumnInfo, DefaultGroupingValue } from "@notion-kit/table-hook";
import type { GroupingValueProps } from "@notion-kit/table-hook";
import { TooltipDescription, TooltipPreset } from "@notion-kit/ui/primitives";

import { OptionTag } from "@/common";

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
          tag.description ? (
            <>
              <TooltipDescription text={tag.name} />
              <TooltipDescription type="secondary" text={tag.description} />
            </>
          ) : (
            tag.name
          )
        }
        side="top"
      >
        <OptionTag {...tag} />
      </TooltipPreset>
    </div>
  );
}
