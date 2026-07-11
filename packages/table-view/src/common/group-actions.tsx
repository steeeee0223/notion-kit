import { useState } from "react";
import type { Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { AlertModal } from "@notion-kit/ui/alert-modal";
import type { Row as RowModel } from "@notion-kit/table-hook";
import {
  Button,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

interface GroupActionsProps {
  className?: string;
  row: Row<RowModel>;
}

export function GroupActions({ className, row }: GroupActionsProps) {
  const { table } = useTableViewCtx();
  const { locked } = table.store.state.tableGlobal;

  const addRow = () => table.addRowToGroup(row.id);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteRows = () => {
    const rowIds = row.subRows.map((subRow) => subRow.id);
    table.deleteRows(rowIds);
    setShowDeleteConfirm(false);
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
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Group options"
              variant="hint"
              className="size-6"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Icon.Dots className="size-3.5 fill-current" />
            </Button>
          }
        />
        <DropdownMenuContent className="w-50">
          <DropdownMenuGroup>
            <DropdownMenuItem
              {...(row.getShouldShowGroupAggregates()
                ? {
                    icon: <Icon.EyeHideInversePadded className="size-6" />,
                    label: "Hide aggregation",
                  }
                : {
                    icon: <Icon.Eye />,
                    label: "Show aggregation",
                  })}
              onClick={row.toggleGroupAggregates}
            />
            <DropdownMenuItem
              icon={<Icon.EyeHideInversePadded className="size-6" />}
              label="Hide group"
              onClick={row.toggleGroupVisibility}
            />
            <DropdownMenuItem
              icon={<Icon.Trash />}
              label="Delete rows"
              closeOnClick={false}
              onClick={() => setShowDeleteConfirm(true)}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertModal
          title="Are you sure? All rows inside this group will be deleted."
          primary="Delete"
          secondary="Cancel"
          onTrigger={deleteRows}
        />
      </Dialog>
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
