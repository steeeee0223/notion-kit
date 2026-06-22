import { useState } from "react";
import { arrayMove } from "@dnd-kit/helpers";
import { useDragOperation, type DragEndEvent } from "@dnd-kit/react";

import { cn } from "@notion-kit/cn";
import { Sortable } from "@notion-kit/ui/primitives";
import {
  Selectable,
  SelectableProps,
  useSelectable,
} from "@notion-kit/ui/selectable";

import { items } from "./constants";

interface DraggableItemProps {
  id: string;
  index: number;
  label: React.ReactNode;
}

interface DraggableItemPreviewProps extends React.ComponentProps<"div"> {
  hidden?: boolean;
  label: React.ReactNode;
  overlay?: boolean;
}

function DraggableItemPreview({
  hidden,
  label,
  overlay,
  className,
  ref,
  ...props
}: DraggableItemPreviewProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg bg-default/10 p-4 text-sm font-medium",
        "data-[selected=true]:bg-blue/30 data-[selected=true]:shadow-notion data-[selecting=true]:bg-blue/15",
        hidden && "opacity-0",
        overlay && "pointer-events-none bg-red/30 shadow-lg",
        className,
      )}
      {...props}
    >
      <div>{label}</div>
    </div>
  );
}

export function DraggableItem({ id, index, label }: DraggableItemProps) {
  const { selectedIds } = useSelectable();
  const isSelected = selectedIds.has(id);
  const { source } = useDragOperation();

  return (
    <Sortable.Item
      id={id}
      index={index}
      data={{ label, isSelected, selectedIds: Array.from(selectedIds) }}
      render={
        <Selectable.Item
          id={id}
          render={
            <DraggableItemPreview
              label={label}
              hidden={
                source !== null &&
                source !== undefined &&
                (source.id === id || isSelected)
              }
            />
          }
        />
      }
    />
  );
}

export function DraggableOverlay() {
  return (
    <Sortable.Overlay>
      {(source) => {
        const selectedIds = source.data.selectedIds as string[] | undefined;
        const isSelected = source.data.isSelected as boolean;
        const activeLabel = source.data.label as React.ReactNode;
        const showMultiple =
          isSelected && selectedIds !== undefined && selectedIds.length > 1;

        return (
          <DraggableItemPreview
            overlay
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
          />
        );
      }}
    </Sortable.Overlay>
  );
}

export function SelectWithDraggableItems(props: SelectableProps) {
  const [orderedItems, setOrderedItems] = useState(items.slice(0, 10));

  const handleDragEnd = (e: DragEndEvent) => {
    const { source, target } = e.operation;
    if (!source || !target || source.id === target.id) return;

    const selectedIdsArray = source.data.selectedIds as string[] | undefined;
    const isSelected = source.data.isSelected as boolean;

    setOrderedItems((v) => {
      // If dragging a selected item with multiple selections, move all selected items
      if (isSelected && selectedIdsArray && selectedIdsArray.length > 1) {
        const activeIndex = v.findIndex((item) => item.id === source.id);
        const overIndex = v.findIndex((item) => item.id === target.id);

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
      const activeIndex = v.findIndex((item) => item.id === source.id);
      const overIndex = v.findIndex((item) => item.id === target.id);

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
      <Sortable.Root
        items={orderedItems.map((item) => item.id)}
        onDragEnd={handleDragEnd}
      >
        <DraggableOverlay />
        <Sortable.List
          className="gap-4"
          render={<Selectable.Group className="flex flex-col gap-4" />}
        >
          {orderedItems.map((item, index) => (
            <DraggableItem
              key={item.id}
              id={item.id}
              index={index}
              label={item.label}
            />
          ))}
        </Sortable.List>
      </Sortable.Root>
    </Selectable>
  );
}
