import { useState } from "react";
import { isSortable } from "@dnd-kit/react/sortable";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import SortableList from "@notion-kit/registry/sortable-list";
import { Checkbox, Sortable } from "@notion-kit/ui/primitives";

const multiSortableItems = [
  { id: "alpha", label: "Alpha" },
  { id: "bravo", label: "Bravo" },
  { id: "charlie", label: "Charlie" },
  { id: "delta", label: "Delta" },
  { id: "echo", label: "Echo" },
  { id: "foxtrot", label: "Foxtrot" },
  { id: "golf", label: "Golf" },
];

type MultiSortableItem = (typeof multiSortableItems)[number];

interface MoveItemsAsGroupOptions {
  items: MultiSortableItem[];
  draggedIds: string[];
  activeId: string;
  destinationIndex: number;
}

interface MultiSortableData {
  draggedIds: string[];
}

function moveItemsAsGroup({
  items,
  draggedIds,
  activeId,
  destinationIndex,
}: MoveItemsAsGroupOptions) {
  const draggedIdSet = new Set(draggedIds);
  const draggedItems = items.filter((item) => draggedIdSet.has(item.id));
  const remainingItems = items.filter((item) => !draggedIdSet.has(item.id));
  const activeGroupIndex = draggedItems.findIndex(
    (item) => item.id === activeId,
  );

  if (activeGroupIndex === -1) return items;

  const insertionIndex = Math.max(
    0,
    Math.min(destinationIndex - activeGroupIndex, remainingItems.length),
  );

  return [
    ...remainingItems.slice(0, insertionIndex),
    ...draggedItems,
    ...remainingItems.slice(insertionIndex),
  ];
}

function MultiItemsSortableList() {
  const [items, setItems] = useState(multiSortableItems);
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(["alpha", "charlie", "echo"]),
  );
  const [draggedIds, setDraggedIds] = useState<string[]>([]);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedItemIds = items
    .filter((item) => selectedIds.has(item.id))
    .map((item) => item.id);
  const draggedIdSet = new Set(draggedIds);
  const draggedItems = items.filter((item) => draggedIdSet.has(item.id));

  return (
    <div className="w-80 space-y-3">
      <p className="text-sm text-secondary">
        Select multiple rows, then drag any selected row to move them together.
      </p>

      <Sortable.Root
        onDragStart={({ operation }) => {
          const { source } = operation;
          if (!source) return;

          const { draggedIds: nextDraggedIds } =
            source.data as MultiSortableData;
          setDraggedIds(nextDraggedIds);
        }}
        onDragEnd={(event) => {
          const { source } = event.operation;
          setDraggedIds([]);

          if (event.canceled || !isSortable(source)) return;

          const { draggedIds: currentDraggedIds } =
            source.data as MultiSortableData;

          setItems((current) =>
            moveItemsAsGroup({
              items: current,
              draggedIds: currentDraggedIds,
              activeId: String(source.id),
              destinationIndex: source.index,
            }),
          );
        }}
      >
        <Sortable.List>
          {items.map((item, index) => {
            const selected = selectedIds.has(item.id);
            const draggingAsGroup = draggedIdSet.has(item.id);

            return (
              <Sortable.Item
                key={item.id}
                id={item.id}
                index={index}
                data={{
                  draggedIds: selected ? selectedItemIds : [item.id],
                }}
                data-selected={selected || undefined}
                data-group-dragging={draggingAsGroup || undefined}
                className="flex h-11 items-center gap-3 px-3 data-group-dragging:opacity-0 data-selected:bg-default/5"
              >
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => toggleSelected(item.id)}
                  onPointerDown={(event) => event.stopPropagation()}
                  aria-label={`Select ${item.label}`}
                />
                <span className="min-w-0 flex-1 text-sm">{item.label}</span>
                <Sortable.Handle className="size-5" />
              </Sortable.Item>
            );
          })}
        </Sortable.List>

        <Sortable.Overlay>
          {() =>
            draggedItems.length > 0 ? (
              <div className="relative w-80">
                <div className="max-h-56 overflow-hidden rounded-lg border-2 border-blue bg-popover shadow-xl">
                  {draggedItems.slice(0, 1).map((item) => (
                    <div
                      key={item.id}
                      className="flex h-11 items-center px-3 text-sm"
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
                {draggedItems.length > 1 && (
                  <div className="absolute -inset-e-2 -top-2 flex size-6 items-center justify-center rounded-full bg-blue text-xs font-medium text-white">
                    {draggedItems.length}
                  </div>
                )}
              </div>
            ) : null
          }
        </Sortable.Overlay>
      </Sortable.Root>
    </div>
  );
}

const meta = {
  title: "Notion UI/Sortable",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  render: () => <SortableList />,
};

export const ListWithItemHandle: Story = {
  render: () => <SortableList itemHandle />,
};

export const MultiItems: Story = {
  render: () => <MultiItemsSortableList />,
};
