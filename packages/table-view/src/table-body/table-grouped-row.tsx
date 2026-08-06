import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import type { RowInstance } from "@notion-kit/table-hook";
import { Button, Checkbox } from "@notion-kit/ui/primitives";

import { GroupActions } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

interface TableGroupedRowProps {
  row: RowInstance;
}

export function TableGroupedRow({ row }: TableGroupedRowProps) {
  const { table } = useTableViewCtx();
  const isMobile = useIsMobile();
  const groupId = row.groupingColumnId;
  if (!groupId) {
    console.error(`No grouping column id found for the grouped row ${row.id}`);
    return null;
  }

  const { layout, locked } = table.getTableGlobalState();
  const groupSelectionState = row.getGroupSelectionState();
  const showSelection = (layout === "table" || layout === "list") && !locked;

  return (
    <div
      role="group"
      aria-label={`Group ${row.id}`}
      className="group/grouped-row h-11"
    >
      <div className="flex h-full items-center">
        {/* Row selection */}
        {showSelection && (
          <div
            data-slot="group-row-action"
            className="sticky left-8 z-(--z-row) flex h-full items-center"
          >
            <div className="absolute -left-10.25 flex h-full w-8 items-center justify-center bg-main">
              <Checkbox
                id={`group-select-${row.id}`}
                size="sm"
                checked={groupSelectionState === "checked"}
                indeterminate={groupSelectionState === "indeterminate"}
                aria-label={`Select group ${row.id}`}
                className={cn(
                  "cursor-pointer rounded-xs accent-blue opacity-0 transition-opacity delay-0 duration-200 group-hover/grouped-row:opacity-100",
                  (groupSelectionState !== "unchecked" || isMobile) &&
                    "opacity-100",
                )}
                onCheckedChange={() => row.toggleGroupSelection()}
              />
            </div>
          </div>
        )}
        <div
          data-slot="grouped-row-content"
          className="flex h-full items-center overflow-hidden"
        >
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
            {row.renderGroupingValue({})}
          </div>
          {/* Count */}
          {row.getShouldShowGroupAggregates() && (
            <Button variant="hint" size="xs" className="text-muted">
              {row.subRows.length}
            </Button>
          )}
          {/* Group actions */}
          <GroupActions
            className="opacity-0 group-hover/grouped-row:opacity-100"
            row={row}
          />
        </div>
      </div>
    </div>
  );
}
