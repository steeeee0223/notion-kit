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

import { useTableViewCtx } from "@/table-contexts";

interface BulkActionMenuProps {
  rowIds: string[];
}

export function BulkActionMenu({ rowIds }: BulkActionMenuProps) {
  const { table } = useTableViewCtx();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const rowCount = rowIds.length;
  const rowLabel = `${rowCount} row${rowCount === 1 ? "" : "s"}`;

  const duplicateRows = () => table.duplicateRows(rowIds);
  const deleteRows = () => {
    table.deleteRows(rowIds);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Button
        aria-label={`Delete ${rowLabel}`}
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
              aria-label="More bulk actions"
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
              label="Duplicate"
              onClick={duplicateRows}
            />
            <DropdownMenuItem
              closeOnClick={false}
              icon={<Icon.Trash />}
              label="Delete"
              variant="error"
              onClick={() => setShowDeleteConfirm(true)}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertModal
          title={`Delete ${rowLabel}?`}
          primary="Delete"
          secondary="Cancel"
          onTrigger={deleteRows}
        />
      </Dialog>
    </>
  );
}
