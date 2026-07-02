import { createContext, use, useMemo } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";

import { cn } from "@notion-kit/cn";

import { Sortable } from "@/primitives";

enum KanbanDnd {
  Item = "item",
  Column = "column",
}

function KanbanRoot({
  children,
  ...props
}: React.ComponentProps<typeof Sortable.Root>) {
  return (
    <Sortable.Root orientation="horizontal" {...props}>
      <Sortable.List data-slot="kanban" className="min-w-max items-start gap-3">
        {children}
      </Sortable.List>
    </Sortable.Root>
  );
}

interface KanbanColumnContextType {
  id: string;
}

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

interface KanbanColumnProps extends React.ComponentProps<typeof Sortable.Item> {
  id: string;
  className?: string;
}

function KanbanColumn({ id, className, ...props }: KanbanColumnProps) {
  const ctx = useMemo(() => ({ id }), [id]);

  return (
    <KanbanColumnContext value={ctx}>
      <Sortable.Item
        data-slot="kanban-column"
        id={id}
        type={KanbanDnd.Column}
        accept={[KanbanDnd.Column, KanbanDnd.Item]}
        className={cn(
          "group/kanban-column mb-4 box-content flex h-max w-65 shrink-0 flex-col items-center gap-2 rounded-lg p-2 text-sm",
          "data-dragging:z-10 data-dragging:bg-default/5",
          className,
        )}
        {...props}
      />
    </KanbanColumnContext>
  );
}

function KanbanColumnHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Sortable.Handle
      data-slot="kanban-column-header"
      render={
        <div
          className={cn("flex w-full hover:bg-transparent", className)}
          {...props}
        />
      }
    />
  );
}

function KanbanColumnContent({
  className,
  ...props
}: React.ComponentProps<typeof Sortable.List>) {
  // const { id } = useKanbanColumnContext();
  // const { ref } = useDroppable({
  //   id: `board-list:${id}`,
  //   type: KanbanDnd.Column,
  //   accept: KanbanDnd.Item,
  //   collisionPriority: CollisionPriority.Low,
  //   data: { columnId: id },
  // });

  return (
    <Sortable.List
      data-slot="kanban-column-content"
      orientation="vertical"
      // ref={ref}
      className={cn("min-h-10 w-full gap-2", className)}
      {...props}
    />
  );
}

interface KanbanItemProps extends React.ComponentProps<typeof Sortable.Item> {
  id: string;
  group: string;
  overlay?: boolean;
}

function KanbanItem({ group, overlay, className, ...props }: KanbanItemProps) {
  return (
    <Sortable.Item
      data-slot="kanban-item"
      type={KanbanDnd.Item}
      accept={KanbanDnd.Item}
      data={{ group }}
      modifiers={[]}
      className={cn(
        "group/card static block h-full min-h-10 animate-bg-in overflow-hidden rounded-lg border border-border-button bg-popover px-2.5 py-2 text-inherit select-none hover:bg-default/5 dark:border-none",
        overlay && "pointer-events-none cursor-grabbing opacity-90 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

const Kanban = {
  Column: KanbanColumn,
  ColumnContent: KanbanColumnContent,
  ColumnHeader: KanbanColumnHeader,
  Item: KanbanItem,
  Root: KanbanRoot,
};
export {
  Kanban,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
  KanbanDnd,
  KanbanItem,
  KanbanRoot,
};
export type { KanbanColumnProps, KanbanItemProps };
