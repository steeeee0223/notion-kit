import type { Row } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import type { Row as RowModel } from "../lib/types";

interface TableGroupedRowProps {
  row: Row<RowModel>;
}

export function TableGroupedRow({ row }: TableGroupedRowProps) {
  const value = String(row.getGroupingValue(row.groupingColumnId ?? ""));

  return (
    <div className="h-11">
      <div className="mt-1.5 flex">
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
        <div>{value || "(Empty)"}</div>
      </div>
    </div>
  );
}
