import { useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import type { RowInstance } from "@notion-kit/table-hook";
import { AlertModal } from "@notion-kit/ui/alert-modal";
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

import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

interface GroupActionsProps {
  className?: string;
  row: RowInstance;
}

export function GroupActions({ className, row }: GroupActionsProps) {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.locked}>
      {(locked) =>
        locked ? null : <GroupActionsContent className={className} row={row} />
      }
    </table.Subscribe>
  );
}

function GroupActionsContent({ className, row }: GroupActionsProps) {
  const { table } = useTableViewCtx();
  const messages = useTableViewMessages();
  const addRow = () => table.addRowToGroup(row.id);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteRows = () => {
    const rowIds = row.subRows.map((subRow) => subRow.id);
    table.deleteRows(rowIds);
    setShowDeleteConfirm(false);
  };

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
              aria-label={messages.groupActions.groupOptions}
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
                    label: messages.groupActions.hideAggregation,
                  }
                : {
                    icon: <Icon.Eye />,
                    label: messages.groupActions.showAggregation,
                  })}
              onClick={() => row.toggleGroupAggregates()}
            />
            <DropdownMenuItem
              icon={<Icon.EyeHideInversePadded className="size-6" />}
              label={messages.groupActions.hideGroup}
              onClick={() => row.toggleGroupVisibility()}
            />
            <DropdownMenuItem
              icon={<Icon.Trash />}
              label={messages.groupActions.deleteRows}
              closeOnClick={false}
              onClick={() => setShowDeleteConfirm(true)}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertModal
          title={messages.groupActions.deleteGroupConfirmTitle}
          primary={messages.groupActions.delete}
          secondary={messages.groupActions.cancel}
          onTrigger={deleteRows}
        />
      </Dialog>
      {/* Create button */}
      <TooltipPreset description={messages.groupActions.createNew} side="top">
        <Button
          aria-label={messages.rowActions.addRow}
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
