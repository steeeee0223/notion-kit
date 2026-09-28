import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from "@notion-kit/ui/primitives";

import { useTableViewMessages } from "@/messages";

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
  const messages = useTableViewMessages();
  return (
    <Dialog
      open={state.target !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent
        className="w-[min(40rem,calc(100vw-2rem))] max-w-none p-5"
        finalFocus={finalFocus}
      >
        <DialogHeader className="items-start pr-8 text-left">
          <DialogTitle typography="h2" className="text-left">
            {messages.editLog.title}
          </DialogTitle>
          <DialogDescription className="text-left text-base">
            {state.target?.type === "row"
              ? state.target.title?.trim()
                ? state.target.title
                : state.target.rowId
              : messages.editLog.tableHistory}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea
          role="region"
          aria-label={messages.editLog.entriesAriaLabel}
          className="mt-4 h-[min(60vh,32rem)] min-w-0"
        >
          <div className="min-w-0 pr-4">
            <ul
              aria-label={messages.editLog.listAriaLabel}
              className="m-0 min-w-0 list-none p-0"
            >
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
                {messages.editLog.loading}
              </p>
            )}
            {state.status === "success" && state.items.length === 0 && (
              <p role="status" className="py-3 text-sm text-secondary">
                {messages.editLog.empty}
              </p>
            )}
            {state.status === "error" ? (
              <div className="flex flex-col items-start gap-2 py-3">
                <p role="alert" className="text-sm text-secondary">
                  {messages.editLog.loadError}
                </p>
                <Button onClick={onRetry}>{messages.editLog.retry}</Button>
              </div>
            ) : (
              state.nextCursor !== null && (
                <Button
                  variant="hint"
                  size="sm"
                  className="my-3"
                  onClick={onLoadMore}
                  disabled={state.status === "loading"}
                >
                  {messages.editLog.loadMore}
                </Button>
              )
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
