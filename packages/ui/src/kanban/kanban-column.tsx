import { createContext, use } from "react";
import { useRender } from "@base-ui/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { useSortable } from "@dnd-kit/react/sortable";

import { cn } from "@notion-kit/cn";

import { KanbanDnd } from "./types";

type KanbanColumnContextType = ReturnType<typeof useSortable>;

const KanbanColumnContext = createContext<KanbanColumnContextType | null>(null);
function useKanbanColumnContext() {
  const context = use(KanbanColumnContext);
  if (!context) {
    throw new Error(
      "useKanbanColumnContext must be used within a KanbanColumnProvider",
    );
  }
  return context;
}

interface KanbanColumnProps extends React.PropsWithChildren {
  id: string;
  index: number;
}

export function KanbanColumn({ id, index, children }: KanbanColumnProps) {
  const sortable = useSortable({
    id,
    index,
    type: KanbanDnd.Column,
    accept: [KanbanDnd.Item, KanbanDnd.Column],
    collisionPriority: CollisionPriority.Low,
    modifiers: [RestrictToHorizontalAxis],
  });
  const { ref, isDropTarget } = sortable;

  return (
    <KanbanColumnContext value={sortable}>
      <div
        data-slot="kanban-column"
        ref={ref}
        className={cn(
          "group/kanban-column mb-4 box-content flex h-max w-65 shrink-0 flex-col items-center gap-2 rounded-lg p-2 text-sm",
          isDropTarget && "z-10 bg-default/5 opacity-80",
        )}
      >
        {children}
      </div>
    </KanbanColumnContext>
  );
}

export function KanbanColumnHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const { handleRef } = useKanbanColumnContext();

  return useRender({
    defaultTagName: "div",
    ref: handleRef,
    render,
    props: {
      "data-slot": "kanban-column-header",
      className: cn("flex w-full cursor-grab items-center", className),
      ...props,
    },
  });
}

export function KanbanColumnContent({
  className,
  ref,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    ref,
    render,
    props: {
      "data-slot": "kanban-column-content",
      className: cn("relative flex min-h-10 w-full flex-col gap-2", className),
      ...props,
    },
  });
}
