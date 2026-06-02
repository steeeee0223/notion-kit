import * as React from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button, type ButtonProps } from "@notion-kit/ui/primitives";

// ─── Context ─────────────────────────────────────────────────────────────────

interface SortableItemContextValue {
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: Record<string, React.EventHandler<React.SyntheticEvent>> | undefined;
  isDragging: boolean;
}

const SortableItemContext = React.createContext<SortableItemContextValue>({
  attributes: {},
  listeners: undefined,
  isDragging: false,
});

// ─── SortableRoot ─────────────────────────────────────────────────────────────

interface SortableRootProps extends React.ComponentProps<"div"> {
  items: string[];
  onReorder: (activeId: string, overId: string) => void;
}

function SortableRoot({ items, onReorder, children, ...props }: SortableRootProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        onReorder(String(active.id), String(over.id));
      }
    },
    [onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div {...props}>{children}</div>
      </SortableContext>
    </DndContext>
  );
}

// ─── SortableItem ─────────────────────────────────────────────────────────────

interface SortableItemProps extends React.ComponentProps<"div"> {
  id: string;
}

function SortableItem({ id, className, style, children, ...props }: SortableItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const contextValue = React.useMemo(
    () => ({
      attributes: attributes as SortableItemContextValue["attributes"],
      listeners: listeners as SortableItemContextValue["listeners"],
      isDragging,
    }),
    [attributes, listeners, isDragging],
  );

  return (
    <SortableItemContext value={contextValue}>
      <div
        ref={setNodeRef}
        className={cn(isDragging && "z-50 opacity-50", className)}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </SortableItemContext>
  );
}

// ─── SortableDragHandle ───────────────────────────────────────────────────────

type SortableDragHandleProps = ButtonProps;

function SortableDragHandle({ children, className, ...props }: SortableDragHandleProps) {
  const { attributes, listeners } = React.use(SortableItemContext);

  return (
    <Button
      variant="hint"
      className={cn("cursor-grab active:cursor-grabbing", className)}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children ?? <Icon.DragHandle className="size-3.5 fill-icon" />}
    </Button>
  );
}

// ─── SortableOverlay ──────────────────────────────────────────────────────────

function SortableOverlay({
  children,
  ...props
}: React.ComponentProps<typeof DragOverlay>) {
  return (
    <DragOverlay dropAnimation={null} {...props}>
      {children}
    </DragOverlay>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const Sortable = {
  Root: SortableRoot,
  Item: SortableItem,
  DragHandle: SortableDragHandle,
  Overlay: SortableOverlay,
};

export { arrayMove };
