"use client";

import type { Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { AlertModal } from "@notion-kit/common/alert-modal";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Dialog,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import type { Row as RowModel } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

interface GroupActionsProps {
  className?: string;
  row: Row<RowModel>;
}

export function GroupActions({ className, row }: GroupActionsProps) {
  const { table } = useTableViewCtx();

  const { locked } = table.getState().tableGlobal;

  const addRow = () => table.addRowToGroup(row.id);
  const handleDeleteRows = () => {
    const rowIds = row.subRows.map((subRow) => subRow.id);
    table.deleteRows(rowIds);
  };

  if (locked) return null;
  return (
    <div
      className={cn(
        "flex items-center transition-opacity has-aria-expanded:opacity-100",
        className,
      )}
    >
      {/* Group settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onPointerDown={(e) => e.stopPropagation()}>
          <Button aria-label="Group options" variant="hint" className="size-6">
            <Icon.Dots className="size-3.5 fill-current" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-50"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              {...(row.getShouldShowGroupAggregates()
                ? {
                    Icon: <Icon.EyeHideInversePadded className="size-6" />,
                    Body: "Hide aggregation",
                  }
                : {
                    Icon: <Icon.Eye />,
                    Body: "Show aggregation",
                  })}
              onSelect={row.toggleGroupAggregates}
            />
            <DropdownMenuItem
              Icon={<Icon.EyeHideInversePadded className="size-6" />}
              Body="Hide group"
              onSelect={row.toggleGroupVisibility}
            />
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  Icon={<Icon.Trash />}
                  Body="Delete rows"
                  onSelect={(e) => e.preventDefault()}
                />
              </DialogTrigger>
              <AlertModal
                title="Are you sure? All rows inside this group will be deleted."
                primary="Delete"
                secondary="Cancel"
                onTrigger={handleDeleteRows}
              />
            </Dialog>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Create button */}
      <TooltipPreset description="Create new" side="top">
        <Button
          aria-label="Add row"
          variant="hint"
          className="size-6"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={addRow}
        >
          <Icon.Plus className="size-3.5 fill-current" />
        </Button>
      </TooltipPreset>
    </div>
  );
}
