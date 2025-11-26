import type { Row } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

import type { Row as RowModel } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

interface TableGroupedRowProps {
  row: Row<RowModel>;
}

export function TableGroupedRow({ row }: TableGroupedRowProps) {
  const { table } = useTableViewCtx();

  const value = String(row.getGroupingValue(row.groupingColumnId ?? ""));
  const addRow = () => {
    if (!row.groupingColumnId) {
      console.error(
        `No grouping column id found for the grouped row ${row.id}`,
      );
      return;
    }
    table.addRowToGroup({
      groupId: row.groupingColumnId,
      value: row.original.properties[row.groupingColumnId]!.value as unknown,
    });
  };

  return (
    <div className="group/grouped-row h-11">
      <div className="flex h-full items-center overflow-hidden">
        {/* Expand button */}
        <Button
          tabIndex={0}
          variant="hint"
          className="size-6"
          aria-expanded={row.getIsExpanded()}
          aria-label={row.getIsExpanded() ? "Close" : "Open"}
          onPointerDown={row.getToggleExpandedHandler()}
        >
          <Icon.ArrowCaretFillSmall
            className="size-[0.8em] fill-menu-icon transition-[rotate]"
            side={row.getIsExpanded() ? "down" : "right"}
          />
        </Button>
        {/* Grouped value */}
        <div className="flex max-w-100 items-center overflow-hidden px-2 text-sm/6 font-medium whitespace-nowrap">
          <span className="truncate">{value || "(Empty)"}</span>
        </div>
        {/* Count */}
        <Button variant="hint" size="xs" className="text-muted">
          {row.subRows.length}
        </Button>
        {/* Group settings */}
        <Button
          variant="hint"
          className="size-6 opacity-0 transition-opacity group-hover/grouped-row:opacity-100"
        >
          <Icon.Dots className="size-3.5 fill-current" />
        </Button>
        {/* Create button */}
        <TooltipPreset description="Create new" side="top">
          <Button
            variant="hint"
            className="size-6 opacity-0 transition-opacity group-hover/grouped-row:opacity-100"
            onClick={addRow}
          >
            <Icon.Plus className="size-3.5 fill-current" />
          </Button>
        </TooltipPreset>
      </div>
    </div>
  );
}
