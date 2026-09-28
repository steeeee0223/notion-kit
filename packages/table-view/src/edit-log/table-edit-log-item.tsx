import { LAYOUT_OPTIONS } from "@notion-kit/table-hook";

import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

import { ActionIcon } from "./action-icon";
import { PropertyIcon } from "./property-icon";
import { ReadOnlyValue } from "./read-only-value";
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
  const property = record.cell?.property ?? record.property;
  return (
    <li className="flex min-w-0 items-center gap-4 border-b border-border py-3 last:border-b-0">
      <EditLogTime editedAt={record.editedAt} />
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
        {property ? (
          <PropertyIcon property={property} />
        ) : (
          <ActionIcon action={record.action} layout={record.layout} />
        )}
        <div className="flex shrink-0 items-center gap-1 text-sm whitespace-nowrap">
          <span className="font-medium">
            {record.cell && `${record.cell.property.name} · `}
            {record.target.name}
          </span>
          <span aria-hidden="true">→</span>
          <EditLogResult record={record} />
        </div>
      </div>
    </li>
  );
}

function EditLogResult({ record }: { record: TableEditLog }) {
  const { plugins } = useTableViewCtx();
  const messages = useTableViewMessages();
  switch (record.action) {
    case "update":
      return <ReadOnlyValue record={{ id: record.id, ...record.cell! }} />;
    case "rename":
      return <span>{messages.editLog.renamedTo(record.target.name)}</span>;
    case "change-type": {
      const type = record.property!.type;
      const name =
        plugins.ui.find((plugin) => plugin.id === type)?.meta.name ?? type;
      return <span>{messages.editLog.changedToType(name)}</span>;
    }
    case "change-layout": {
      const layoutLabel =
        messages.layoutMenu.layouts[record.layout!] ??
        LAYOUT_OPTIONS.find((layout) => layout.value === record.layout)!.label;
      return <span>{messages.editLog.changedToView(layoutLabel)}</span>;
    }
    case "group":
      return record.groupBy ? (
        <>
          <span>{messages.editLog.groupedBy}</span>
          <PropertyIcon property={record.groupBy} />
          <span>{record.groupBy.name}</span>
        </>
      ) : (
        <span>{messages.editLog.removedGrouping}</span>
      );
    default:
      return <span>{messages.editLog.actions[record.action]}</span>;
  }
}
