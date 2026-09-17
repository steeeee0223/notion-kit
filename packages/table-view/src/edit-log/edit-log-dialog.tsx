import { Icon } from "@notion-kit/icons";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from "@notion-kit/ui/primitives";

import { RowEditLogItem } from "./row-edit-log-item";
import { TableEditLogItem } from "./table-edit-log-item";
import type { EditLogState } from "./use-edit-log";

interface EditLogDialogProps {
  state: EditLogState;
  onClose: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
  finalFocus?: () => HTMLElement | null;
  onOpenChangeComplete?: (open: boolean) => void;
}

export function EditLogDialog({
  state,
  onClose,
  onLoadMore,
  onRetry,
  finalFocus,
  onOpenChangeComplete,
}: EditLogDialogProps) {
  return (
    <Dialog
      open={state.target !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent
        hideClose
        className="w-[min(40rem,calc(100vw-2rem))] max-w-none p-5"
        finalFocus={finalFocus}
      >
        <DialogClose
          render={<Button aria-label="Close" variant="close" size="circle" />}
          className="absolute top-4 right-4"
        >
          <Icon.Close aria-hidden="true" className="size-3.5 fill-secondary" />
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Edit log</DialogTitle>
          <DialogDescription>
            {state.target?.type === "row"
              ? state.target.title?.trim()
                ? state.target.title
                : state.target.rowId
              : "Table history"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea
          role="region"
          aria-label="Edit log entries"
          className="mt-4 h-[min(60vh,32rem)] min-w-0"
        >
          <div className="min-w-0 pr-4">
            <ul aria-label="Edit logs" className="m-0 min-w-0 list-none p-0">
              {state.items.map((record) =>
                "rowId" in record ? (
                  <RowEditLogItem key={record.id} record={record} />
                ) : (
                  <TableEditLogItem key={record.id} record={record} />
                ),
              )}
            </ul>
            {state.status === "loading" && (
              <p role="status" className="py-3 text-sm text-secondary">
                Loading edit logs…
              </p>
            )}
            {state.status === "success" && state.items.length === 0 && (
              <p role="status" className="py-3 text-sm text-secondary">
                No edit logs yet
              </p>
            )}
            {state.status === "error" ? (
              <div className="flex flex-col items-start gap-2 py-3">
                <p role="alert" className="text-sm text-secondary">
                  Could not load edit logs.
                </p>
                <Button onClick={onRetry}>Retry</Button>
              </div>
            ) : (
              state.nextCursor !== null && (
                <Button
                  className="my-3"
                  onClick={onLoadMore}
                  disabled={state.status === "loading"}
                >
                  Load more
                </Button>
              )
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
