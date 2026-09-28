import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import { AlertModal } from "@notion-kit/ui/alert-modal";
import {
  Button,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

interface BulkActionMenuProps {
  rowIds: string[];
}

export function BulkActionMenu({ rowIds }: BulkActionMenuProps) {
  const { table } = useTableViewCtx();
  const messages = useTableViewMessages();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const rowLabel = messages.bulkEdit.rowCount(rowIds.length);

  const duplicateRows = () => table.duplicateRows(rowIds);
  const deleteRows = () => {
    table.deleteRows(rowIds);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Button
        aria-label={messages.bulkEdit.deleteRows(rowLabel)}
        variant="hint"
        className="h-full shrink-0 rounded-none border-r px-2"
        onClick={() => setShowDeleteConfirm(true)}
      >
        <Icon.Trash className="fill-red" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={messages.bulkEdit.moreBulkActions}
              variant="hint"
              className="h-full shrink-0 rounded-none px-2"
            >
              <Icon.Dots className="size-4 fill-menu-icon" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem
              icon={<Icon.Duplicate />}
              label={messages.bulkEdit.duplicate}
              onClick={duplicateRows}
            />
            <DropdownMenuItem
              closeOnClick={false}
              icon={<Icon.Trash />}
              label={messages.bulkEdit.delete}
              variant="error"
              onClick={() => setShowDeleteConfirm(true)}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertModal
          title={messages.bulkEdit.deleteRowsConfirmTitle(rowLabel)}
          primary={messages.bulkEdit.delete}
          secondary={messages.bulkEdit.cancel}
          onTrigger={deleteRows}
        />
      </Dialog>
    </>
  );
}
