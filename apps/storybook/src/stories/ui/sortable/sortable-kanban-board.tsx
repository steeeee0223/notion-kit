import { useRef, useState, type ComponentProps } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { move } from "@dnd-kit/helpers";
import {
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
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
    target.type !== "board-list" ||
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

interface BoardCardPreviewProps extends ComponentProps<"div"> {
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
    <Sortable.Item
      id={card.id}
      index={index}
      group={columnId}
      type="board-card"
      accept="board-card"
      data={{ columnId, title: card.title }}
      modifiers={[]}
      render={<BoardCardPreview card={card} />}
    />
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
  const { isDropTarget, ref } = useDroppable({
    id: `board-list:${column.id}`,
    type: "board-list",
    accept: "board-card",
    collisionPriority: CollisionPriority.Low,
    data: { columnId: column.id },
  });

  return (
    <Sortable.Item
      id={column.id}
      index={index}
      type="board-column"
      accept="board-column"
      className="group/board-column mb-4 box-content flex h-max w-65 shrink-0 flex-col items-center gap-2 rounded-lg p-2 text-sm data-dragging:z-10 data-dragging:bg-default/5"
      render={<section aria-labelledby={`${column.id}-title`} />}
    >
      <div className="flex w-full items-center gap-1">
        <Sortable.Handle className="size-6" />
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
          className="ml-auto opacity-0 group-hover/board-column:opacity-100"
        >
          <Icon.Dots className="size-3.5 fill-current" />
        </Button>
      </div>

      <Sortable.List
        orientation="vertical"
        ref={ref}
        data-drop-target={isDropTarget || undefined}
        className="relative min-h-10 w-full gap-2 rounded-lg data-drop-target:bg-blue/5"
      >
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
        {isDropTarget && itemIds.length === 0 && (
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-full bg-blue/30" />
        )}
      </Sortable.List>

      <Button size="sm" className="w-full rounded-lg text-secondary">
        <Icon.Plus className="fill-current" />
        New page
      </Button>
    </Sortable.Item>
  );
}

export function SortableKanbanBoard() {
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
    if (source?.type !== "board-card") return;

    snapshotRef.current = itemsRef.current;
    setActiveCardId(String(source.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.operation.source?.type !== "board-card") return;

    const next = moveBoardCards(itemsRef.current, event);
    if (next !== itemsRef.current) updateItems(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const sourceType = event.operation.source?.type;
    if (sourceType === "board-column") {
      const orderedIds = getSortableItemsAfterDrag(columnOrder, event);
      if (orderedIds) setColumnOrder(orderedIds);
      setDragVersion((version) => version + 1);
      return;
    }
    if (sourceType !== "board-card") return;

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
    <div className="max-w-215 overflow-x-auto rounded-lg bg-main p-4">
      <Sortable.Root
        orientation="horizontal"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Sortable.List className="min-w-max items-start gap-3">
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
        </Sortable.List>
        <Sortable.Overlay>
          {activeCard && <BoardCardPreview card={activeCard} overlay />}
        </Sortable.Overlay>
      </Sortable.Root>
    </div>
  );
}
