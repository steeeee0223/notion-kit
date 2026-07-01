import { useRender } from "@base-ui/react";
import { useSortable } from "@dnd-kit/react/sortable";

import { cn } from "@notion-kit/cn";

import { KanbanDnd } from "./types";

interface KanbanItemProps extends useRender.ComponentProps<"div"> {
  id: string;
  index: number;
  groupId: string;
}

export function KanbanItem({
  id,
  index,
  groupId,
  className,
  render,
  ...props
}: KanbanItemProps) {
  const sortable = useSortable({
    id,
    index,
    type: KanbanDnd.Item,
    accept: KanbanDnd.Item,
    group: groupId,
  });
  const { ref, isDragging } = sortable;

  return useRender({
    defaultTagName: "div",
    ref,
    render,
    props: {
      "data-slot": "kanban-item",
      "data-dragging": isDragging,
      className: cn(
        "group/card static block h-full min-h-10 animate-bg-in cursor-grab overflow-hidden rounded-lg border border-border-button bg-popover px-2.5 py-2 text-inherit select-none hover:bg-default/5 dark:border-none",
        isDragging && "cursor-grabbing opacity-80",
        className,
      ),
      ...props,
    },
  });
}
