import { Icon } from "@notion-kit/icons";
import { IconBlock } from "@notion-kit/ui/icon-block";

import { useTableViewCtx } from "@/table-contexts";

import type { RowEditLog } from "./types";

export function PropertyIcon({
  property,
}: {
  property: RowEditLog["property"];
}) {
  const { plugins } = useTableViewCtx();
  const plugin = plugins.ui.find((candidate) => candidate.id === property.type);
  return (
    <span
      aria-hidden="true"
      className="shrink-0 [&_svg]:size-4 [&_svg]:fill-icon"
    >
      {property.icon ? (
        <IconBlock icon={property.icon} />
      ) : (
        (plugin?.default.icon ?? <Icon.TypesText />)
      )}
    </span>
  );
}
