import { ActionIcon } from "./action-icon";
import { PropertyIcon } from "./property-icon";
import type { TableEditLog } from "./types";

export function EditLogTime({ editedAt }: { editedAt: number }) {
  const date = new Date(editedAt);
  return (
    <time
      dateTime={date.toISOString()}
      className="shrink-0 text-xs whitespace-nowrap text-secondary"
    >
      {date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </time>
  );
}

export function TableEditLogItem({ record }: { record: TableEditLog }) {
  return (
    <li className="flex min-w-0 items-center gap-4 border-b border-border py-3 last:border-b-0">
      <EditLogTime editedAt={record.editedAt} />
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
        {record.property ? (
          <PropertyIcon property={record.property} />
        ) : (
          <ActionIcon action={record.action} />
        )}
        <div className="flex shrink-0 items-center gap-1 text-sm whitespace-nowrap">
          <span className="font-medium">{record.target.name}</span>
          <span aria-hidden="true">→</span>
          <span>{record.summary}</span>
        </div>
      </div>
    </li>
  );
}
