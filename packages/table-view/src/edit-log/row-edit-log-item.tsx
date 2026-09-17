import { Icon } from "@notion-kit/icons";
import { IconBlock } from "@notion-kit/ui/icon-block";

import { useTableViewCtx } from "@/table-contexts";

import { ReadOnlyValue } from "./read-only-value";
import { EditLogTime } from "./table-edit-log-item";
import type { RowEditLog } from "./types";

export function RowEditLogItem({ record }: { record: RowEditLog }) {
  const { plugins } = useTableViewCtx();
  const plugin = plugins.ui.find(
    (candidate) => candidate.id === record.property.type,
  );
  return (
    <li className="flex min-w-0 flex-col gap-2 border-b border-border py-3 last:border-b-0">
      <EditLogTime editedAt={record.editedAt} />
      <div className="flex min-w-0 items-start gap-2">
        <span
          aria-hidden="true"
          className="shrink-0 [&_svg]:size-4 [&_svg]:fill-icon"
        >
          {record.property.icon ? (
            <IconBlock icon={record.property.icon} />
          ) : (
            (plugin?.default.icon ?? <Icon.TypesText />)
          )}
        </span>
        <div className="min-w-0 flex-1 text-sm wrap-anywhere whitespace-pre-wrap">
          <span className="font-medium">{record.property.name}</span>
          <span aria-hidden="true"> → </span>
          <div className="min-w-0">
            <ReadOnlyValue record={record} />
          </div>
        </div>
      </div>
    </li>
  );
}
