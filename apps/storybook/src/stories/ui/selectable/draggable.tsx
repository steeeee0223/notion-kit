import { useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDndContext,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

import { cn } from "@notion-kit/cn";
import {
  Selectable,
  SelectableProps,
  useSelectable,
} from "@notion-kit/selectable";

import { items } from "./constants";

interface DraggableItemProps {
  id: string;
  label: React.ReactNode;
  overlay?: boolean;
}

export function DraggableItem({ id, label, overlay }: DraggableItemProps) {
  const { selectedIds } = useSelectable();
  const isSelected = selectedIds.has(id);

  const {
    setNodeRef,
    isDragging,
    active,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({
    id,
    data: { label, isSelected, selectedIds: Array.from(selectedIds) },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Selectable.Item key={id} id={id} asChild>
      <div
        className={cn(
          "rounded-lg bg-default/10 p-4 text-sm font-medium transition-[background]",
          "aria-selected:bg-blue/30 aria-selected:shadow-notion data-[selecting=true]:bg-blue/15",
          (isDragging || (active !== null && isSelected)) && "opacity-0",
          overlay && "pointer-events-none bg-red/30 shadow-lg",
        )}
        ref={setNodeRef}
        style={overlay ? undefined : style}
        {...attributes}
        {...listeners}
      >
        <div>{label}</div>
      </div>
    </Selectable.Item>
  );
}

export function DraggableOverlay() {
  const { active } = useDndContext();

  if (!active) return null;

  const selectedIds = active.data.current?.selectedIds as string[] | undefined;
  const isSelected = active.data.current?.isSelected as boolean;
  const activeLabel = active.data.current?.label as string;

  // If the dragged item is selected, show all selected items in overlay
  const showMultiple = isSelected && selectedIds && selectedIds.length > 1;

  return typeof window !== "undefined"
    ? createPortal(
        <DragOverlay dropAnimation={null}>
          <DraggableItem
            id={active.id.toString()}
            label={
              <span>
                {activeLabel}
                {showMultiple && (
                  <span className="ml-2 text-secondary">
                    +{selectedIds.length - 1} more items
                  </span>
                )}
              </span>
            }
            overlay
          />
        </DragOverlay>,
        document.body,
      )
    : null;
}

export function SelectWithDraggableItems(props: SelectableProps) {
  const [orderedItems, setOrderedItems] = useState(items.slice(0, 10));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const selectedIdsArray = active.data.current?.selectedIds as
      | string[]
      | undefined;
    const isSelected = active.data.current?.isSelected as boolean;

    setOrderedItems((v) => {
      // If dragging a selected item with multiple selections, move all selected items
      if (isSelected && selectedIdsArray && selectedIdsArray.length > 1) {
        const activeIndex = v.findIndex((item) => item.id === active.id);
        const overIndex = v.findIndex((item) => item.id === over.id);

        // Get all selected items in their current order
        const selectedItems = v.filter((item) =>
          selectedIdsArray.includes(item.id),
        );

        // Get non-selected items
        const nonSelectedItems = v.filter(
          (item) => !selectedIdsArray.includes(item.id),
        );

        // Determine insert position
        let insertIndex: number;
        if (overIndex === -1) {
          insertIndex = nonSelectedItems.length;
        } else {
          // Find the position in non-selected items
          const overItem = v[overIndex];
          if (!overItem) {
            console.error("Over item not found", overIndex);
            return v as never;
          }
          const overIndexInNonSelected = nonSelectedItems.findIndex(
            (item) => item.id === overItem.id,
          );

          // If moving down, insert after; if moving up, insert before
          insertIndex =
            activeIndex < overIndex
              ? overIndexInNonSelected + 1
              : overIndexInNonSelected;
        }

        // Insert selected items at the new position
        const result = [
          ...nonSelectedItems.slice(0, insertIndex),
          ...selectedItems,
          ...nonSelectedItems.slice(insertIndex),
        ];

        return result;
      }

      // Single item drag - original behavior
      const activeIndex = v.findIndex((item) => item.id === active.id);
      const overIndex = v.findIndex((item) => item.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return v;

      return arrayMove(v, activeIndex, overIndex);
    });
  };

  return (
    <Selectable
      {...props}
      className="min-h-[500px] min-w-120 rounded-lg bg-popover p-6 shadow-sm"
    >
      <Selectable.Overlay className="rounded-sm border-2 border-blue bg-blue/10" />
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <DraggableOverlay />
        <Selectable.Group className="flex flex-col gap-4">
          <SortableContext
            items={orderedItems}
            strategy={verticalListSortingStrategy}
          >
            {orderedItems.map((item) => (
              <DraggableItem key={item.id} id={item.id} label={item.label} />
            ))}
          </SortableContext>
        </Selectable.Group>
      </DndContext>
    </Selectable>
  );
}
