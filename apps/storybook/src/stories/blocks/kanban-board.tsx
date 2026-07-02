import React, { useId, useRef, useState } from "react";
import { move } from "@dnd-kit/helpers";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Kanban, KanbanDnd } from "@notion-kit/ui/kanban";
import {
  Badge,
  Button,
  getSortableItemsAfterDrag,
  Sortable,
} from "@notion-kit/ui/primitives";

interface BoardColumn {
  id: string;
  title: string;
  variant: "blue" | "gray" | "orange";
}

interface BoardCard {
  id: string;
  title: string;
  detail: string;
}

type BoardItems = Record<string, string[]>;

const boardColumns: BoardColumn[] = [
  { id: "column:not-started", title: "Not started", variant: "gray" },
  { id: "column:in-progress", title: "In progress", variant: "orange" },
  { id: "column:done", title: "Done", variant: "blue" },
];

const boardCards: BoardCard[] = [
  {
    id: "card:project-brief",
    title: "Write project brief",
    detail: "Planning",
  },
  {
    id: "card:research",
    title: "Review interaction patterns",
    detail: "Research",
  },
  {
    id: "card:sortable-story",
    title: "Build sortable story",
    detail: "Engineering",
  },
  {
    id: "card:polish",
    title: "Polish board states",
    detail: "Design",
  },
  {
    id: "card:documentation",
    title: "Ship documentation",
    detail: "Docs",
  },
];

const boardCardsById = new Map(boardCards.map((card) => [card.id, card]));

const initialBoardItems: BoardItems = {
  "column:not-started": ["card:project-brief", "card:research"],
  "column:in-progress": ["card:sortable-story", "card:polish"],
  "column:done": ["card:documentation"],
};

function findCardColumn(items: BoardItems, cardId: string) {
  return Object.keys(items).find((columnId) =>
    items[columnId]?.includes(cardId),
  );
}

function haveSameCardSet(a: BoardItems, b: BoardItems) {
  const aIds = Object.values(a).flat();
  const bIds = Object.values(b).flat();
  const aSet = new Set(aIds);
  const bSet = new Set(bIds);

  return (
    aIds.length === aSet.size &&
    bIds.length === bSet.size &&
    aSet.size === bSet.size &&
    [...aSet].every((id) => bSet.has(id))
  );
}

function moveBoardCards(
  items: BoardItems,
  event: DragOverEvent | DragEndEvent,
) {
  const { source, target } = event.operation;
  if (!source || !target) return items;

  const moved = move(items, event);
  if (moved !== items && haveSameCardSet(items, moved)) return moved;

  const sourceId = String(source.id);
  const sourceColumnId = findCardColumn(items, sourceId);
  const targetColumnId: unknown = target.data.columnId;
  if (
    !sourceColumnId ||
    target.type !== KanbanDnd.Column ||
    typeof targetColumnId !== "string" ||
    items[targetColumnId] === undefined
  ) {
    return items;
  }

  const sourceItems = items[sourceColumnId];
  if (!sourceItems) return items;

  const next = {
    ...items,
    [sourceColumnId]: sourceItems.filter((id) => id !== sourceId),
    [targetColumnId]: [
      ...(sourceColumnId === targetColumnId
        ? sourceItems.filter((id) => id !== sourceId)
        : (items[targetColumnId] ?? [])),
      sourceId,
    ],
  };

  return haveSameCardSet(items, next) ? next : items;
}

interface BoardCardPreviewProps extends React.ComponentProps<"div"> {
  card: BoardCard;
  overlay?: boolean;
}

function BoardCardPreview({
  card,
  className,
  overlay,
  ref,
  ...props
}: BoardCardPreviewProps) {
  return (
    <div
      ref={ref}
      role="article"
      aria-label={card.title}
      className={cn(
        "group/card min-h-20 rounded-lg border border-border-button bg-popover px-3 py-2.5 text-sm shadow-xs select-none hover:bg-default/5 dark:border-none",
        "data-dragging:z-10 data-dragging:opacity-80 data-dragging:shadow-lg data-dragging:ring-2 data-dragging:ring-ring",
        overlay && "pointer-events-none cursor-grabbing opacity-90 shadow-lg",
        className,
      )}
      {...props}
    >
      <div className="font-medium wrap-break-word whitespace-pre-wrap">
        {card.title}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-secondary">
        <Icon.Clock className="size-3.5 fill-current" />
        {card.detail}
      </div>
    </div>
  );
}

function SortableBoardCard({
  card,
  columnId,
  index,
}: {
  card: BoardCard;
  columnId: string;
  index: number;
}) {
  return (
    <Kanban.Item
      id={card.id}
      index={index}
      group={columnId}
      // render={<BoardCardPreview card={card} />}
    >
      <div className="font-medium wrap-break-word whitespace-pre-wrap">
        {card.title}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-secondary">
        <Icon.Clock className="size-3.5 fill-current" />
        {card.detail}
      </div>
    </Kanban.Item>
  );
}

function KanbanColumn({
  column,
  index,
  itemIds,
}: {
  column: BoardColumn;
  index: number;
  itemIds: string[];
}) {
  return (
    <Kanban.Column
      id={column.id}
      index={index}
      render={<section aria-labelledby={`${column.id}-title`} />}
    >
      <Kanban.ColumnHeader>
        <h3 id={`${column.id}-title`} className="min-w-0 truncate text-sm/6">
          <Badge variant={column.variant} className="max-w-full">
            {column.title}
          </Badge>
        </h3>
        <span className="text-xs text-muted">{itemIds.length}</span>
        <Button
          variant="hint"
          size="xs"
          aria-label={`${column.title} actions`}
          className="ml-auto opacity-0 group-hover/kanban-column:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Icon.Dots className="size-3.5 fill-current" />
        </Button>
      </Kanban.ColumnHeader>

      <Kanban.ColumnContent>
        {itemIds.map((itemId, itemIndex) => {
          const card = boardCardsById.get(itemId);
          if (!card) return null;

          return (
            <SortableBoardCard
              key={card.id}
              card={card}
              columnId={column.id}
              index={itemIndex}
            />
          );
        })}
      </Kanban.ColumnContent>

      <Button size="sm" className="w-full rounded-lg text-secondary">
        <Icon.Plus className="fill-current" />
        New page
      </Button>
    </Kanban.Column>
  );
}

export function KanbanBoard() {
  const blockId = useId();

  const [columnOrder, setColumnOrder] = useState(
    boardColumns.map((column) => column.id),
  );
  const [items, setItems] = useState(initialBoardItems);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [dragVersion, setDragVersion] = useState(0);
  const itemsRef = useRef(items);
  const snapshotRef = useRef<BoardItems | null>(null);

  const updateItems = (next: BoardItems) => {
    itemsRef.current = next;
    setItems(next);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { source } = event.operation;
    if (source?.type !== KanbanDnd.Item) return;

    snapshotRef.current = itemsRef.current;
    setActiveCardId(String(source.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.operation.source?.type !== KanbanDnd.Item) return;

    const next = moveBoardCards(itemsRef.current, event);
    if (next !== itemsRef.current) updateItems(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const sourceType = event.operation.source?.type;
    if (sourceType === KanbanDnd.Column) {
      setColumnOrder(getSortableItemsAfterDrag(columnOrder, event));
      setDragVersion((version) => version + 1);
      return;
    }
    if (sourceType !== KanbanDnd.Item) return;

    if (event.canceled) {
      if (snapshotRef.current) updateItems(snapshotRef.current);
    }

    setActiveCardId(null);
    setDragVersion((version) => version + 1);
    snapshotRef.current = null;
  };

  const activeCard = activeCardId
    ? boardCardsById.get(activeCardId)
    : undefined;

  return (
    <div data-slot="notion-board-view" className="relative float-start px-24">
      <div className="contain-layout">
        <div
          data-block-id={blockId}
          className="relative flex min-w-full grow py-2"
        >
          <Kanban.Root
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {columnOrder.map((columnId, index) => {
              const column = boardColumns.find((item) => item.id === columnId);
              if (!column) return null;

              return (
                <KanbanColumn
                  key={`${column.id}:${dragVersion}`}
                  column={column}
                  index={index}
                  itemIds={items[column.id] ?? []}
                />
              );
            })}

            <Sortable.Overlay>
              {activeCard && <BoardCardPreview card={activeCard} overlay />}
            </Sortable.Overlay>
          </Kanban.Root>
        </div>
      </div>
    </div>
  );
}
