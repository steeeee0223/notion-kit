"use client";

import type { Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
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

interface GroupActionsProps {
  className?: string;
  row: Row<RowModel>;
}

export function GroupActions({ className, row }: GroupActionsProps) {
  const { table } = useTableViewCtx();
  const { openModal } = useModal();

  const { locked } = table.getState().tableGlobal;
  const groupId = row.groupingColumnId!;

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
        <DropdownMenuTrigger asChild>
          <Button aria-label="Group options" variant="hint" className="size-6">
            <Icon.Dots className="size-3.5 fill-current" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-990 w-50">
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
          aria-label="Add row"
          variant="hint"
          className="size-6"
          onClick={addRow}
        >
          <Icon.Plus className="size-3.5 fill-current" />
        </Button>
      </TooltipPreset>
    </div>
  );
}
