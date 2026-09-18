import { Icon, type IconProps } from "@notion-kit/icons";

import { LayoutIcon } from "@/common/default-icon";

import type { TableEditLog, TableEditLogAction } from "./types";

const actionIcons: Record<
  Exclude<TableEditLogAction, "change-layout">,
  React.ComponentType<IconProps>
> = {
  create: Icon.Plus,
  duplicate: Icon.Duplicate,
  delete: Icon.Trash,
  restore: Icon.Undo,
  hide: Icon.EyeHide,
  show: Icon.Eye,
  move: Icon.ArrowUpDown,
  resize: Icon.ArrowLeftRight,
  update: Icon.Sliders,
  rename: Icon.Sliders,
  "update-config": Icon.Sliders,
  "change-type": Icon.Sliders,
  lock: Icon.Lock,
  unlock: Icon.LockOpen,
  filter: Icon.FilterSmall,
  sort: Icon.ArrowUpDown,
  group: Icon.SquareGridBelowLines,
  "update-grouping": Icon.SquareGridBelowLines,
  "sort-groups": Icon.SquareGridBelowLines,
  "create-row": Icon.Plus,
  "update-row": Icon.Sliders,
  "delete-rows": Icon.Trash,
  "duplicate-row": Icon.Duplicate,
  "duplicate-rows": Icon.Duplicate,
  "move-row": Icon.ArrowUpDown,
  "change-row-display": Icon.Sliders,
  "change-date-range": Icon.TypesDate,
  "change-date-property": Icon.TypesDate,
};

export function ActionIcon({
  action,
  layout,
}: Pick<TableEditLog, "action" | "layout">) {
  if (action === "change-layout") {
    return (
      <span aria-hidden="true" className="shrink-0">
        <LayoutIcon layout={layout!} className="size-4 fill-icon" />
      </span>
    );
  }
  const Component = actionIcons[action];
  return <Component aria-hidden="true" className="size-4 shrink-0 fill-icon" />;
}
