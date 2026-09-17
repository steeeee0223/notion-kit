import { ActionIcon } from "./action-icon";
import type { TableEditLog } from "./types";

export function EditLogTime({ editedAt }: { editedAt: number }) {
  const date = new Date(editedAt);
  return (
    <time dateTime={date.toISOString()} className="text-xs text-secondary">
      {date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </time>
  );
}

export function TableEditLogItem({ record }: { record: TableEditLog }) {
  return (
    <li className="flex min-w-0 flex-col gap-2 border-b border-border py-3 last:border-b-0">
      <EditLogTime editedAt={record.editedAt} />
      <div className="flex min-w-0 items-start gap-2">
        <ActionIcon action={record.action} />
        <div className="min-w-0 flex-1 text-sm wrap-anywhere whitespace-pre-wrap">
          <span className="font-medium">{record.target.name}</span>
          <span aria-hidden="true"> → </span>
          <span>{record.summary}</span>
        </div>
      </div>
    </li>
  );
}
