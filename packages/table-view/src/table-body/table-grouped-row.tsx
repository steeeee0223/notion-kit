import type { Row } from "@tanstack/react-table";

import { BaseModal } from "@notion-kit/common";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import type { Row as RowModel } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

interface TableGroupedRowProps {
  row: Row<RowModel>;
}

export function TableGroupedRow({ row }: TableGroupedRowProps) {
  const { table } = useTableViewCtx();
  const { openModal } = useModal();

  const { locked } = table.getState().tableGlobal;
  const groupId = row.groupingColumnId;
  if (!groupId) {
    console.error(`No grouping column id found for the grouped row ${row.id}`);
    return null;
  }

  const addRow = () => {
    table.addRowToGroup({
      groupId,
      value: row.original.properties[groupId]!.value as unknown,
    });
  };
  const deleteRows = () => {
    const rowIds = row.subRows.map((subRow) => subRow.id);
    openModal(
      <BaseModal
        title="Are you sure? All rows inside this group will be deleted."
        primary="Delete"
        secondary="Cancel"
        onTrigger={() => table.deleteRows(rowIds)}
      />,
    );
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
          {row.renderGroupingValue({})}
        </div>
        {/* Count */}
        {row.getShouldShowGroupAggregates() && (
          <Button variant="hint" size="xs" className="text-muted">
            {row.subRows.length}
          </Button>
        )}
        {!locked && (
          <>
            {/* Group settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="hint"
                  className="size-6 opacity-0 transition-opacity group-hover/grouped-row:opacity-100 aria-expanded:opacity-100"
                >
                  <Icon.Dots className="size-3.5 fill-current" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-990 w-50">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    {...(row.getShouldShowGroupAggregates()
                      ? {
                          Icon: (
                            <Icon.EyeHideInversePadded className="size-6" />
                          ),
                          Body: "Hide aggregation",
                        }
                      : {
                          Icon: <Icon.Eye />,
                          Body: "Show aggregation",
                        })}
                    onClick={row.toggleGroupAggregates}
                  />
                  <DropdownMenuItem
                    Icon={<Icon.EyeHideInversePadded className="size-6" />}
                    Body="Hide group"
                    onClick={row.toggleGroupVisibility}
                  />
                  <DropdownMenuItem
                    Icon={<Icon.Trash />}
                    Body="Delete rows"
                    onClick={deleteRows}
                  />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
          </>
        )}
      </div>
    </div>
  );
}
