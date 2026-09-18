import { PropertyIcon } from "./property-icon";
import { ReadOnlyValue } from "./read-only-value";
import { EditLogTime } from "./table-edit-log-item";
import type { RowEditLog } from "./types";

export function RowEditLogItem({ record }: { record: RowEditLog }) {
  return (
    <li className="flex min-w-0 items-center gap-4 border-b border-border py-3 last:border-b-0">
      <EditLogTime editedAt={record.editedAt} />
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
        <PropertyIcon property={record.property} />
        <div className="flex shrink-0 items-center gap-1 text-sm whitespace-nowrap">
          <span className="font-medium">{record.property.name}</span>
          <span aria-hidden="true">→</span>
          <ReadOnlyValue record={record} />
        </div>
      </div>
    </li>
  );
}
