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

function SortableSelectableItems() {
  const [orderedItems, setOrderedItems] = useState(items.slice(0, 10));
  const { selectedIds } = useSelectable();

  const handleDragEnd = (e: DragEndEvent) => {
    const { source, target } = e.operation;
    if (!source || !target || source.id === target.id) return;

    const sourceId = String(source.id);
    const targetId = String(target.id);

    setOrderedItems((v) => {
      const sourceIndex = v.findIndex((item) => item.id === sourceId);
      const targetIndex = v.findIndex((item) => item.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return v;

      if (selectedIds.has(sourceId) && selectedIds.size > 1) {
        if (selectedIds.has(targetId)) return v;

        const selectedItems = v.filter((item) => selectedIds.has(item.id));
        const nonSelectedItems = v.filter((item) => !selectedIds.has(item.id));
        const targetIndexInNonSelected = nonSelectedItems.findIndex(
          (item) => item.id === targetId,
        );

        if (targetIndexInNonSelected === -1) return v;

        const insertIndex =
          sourceIndex < targetIndex
            ? targetIndexInNonSelected + 1
            : targetIndexInNonSelected;

        return [
          ...nonSelectedItems.slice(0, insertIndex),
          ...selectedItems,
          ...nonSelectedItems.slice(insertIndex),
        ];
      }

      return arrayMove(v, sourceIndex, targetIndex);
    });
  };

  return (
    <Sortable.Root
      items={orderedItems.map((item) => item.id)}
      onDragEnd={handleDragEnd}
    >
      <Sortable.Overlay>
        {({ data }) => {
          const selectedIds = data.selectedIds as string[] | undefined;
          const isSelected = data.isSelected as boolean;
          const activeLabel = data.label as React.ReactNode;
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
      <Sortable.List className="gap-4">
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
  );
}

export function SelectWithDraggableItems(props: SelectableProps) {
  return (
    <Selectable
      {...props}
      className="min-h-125 min-w-120 rounded-lg bg-popover p-6 shadow-sm"
    >
      <Selectable.Overlay className="rounded-sm border-2 border-blue bg-blue/10" />
      <SortableSelectableItems />
    </Selectable>
  );
}
