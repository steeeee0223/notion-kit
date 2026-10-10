"use client";

import { useId, useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  applyKanbanMove,
  Kanban,
  KanbanDnd,
  type KanbanItems,
  type KanbanValue,
} from "@notion-kit/ui/kanban";
import { Badge, Button } from "@notion-kit/ui/primitives";

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

const initialBoardItems: KanbanItems = {
  "column:not-started": ["card:project-brief", "card:research"],
  "column:in-progress": ["card:sortable-story", "card:polish"],
  "column:done": ["card:documentation"],
};

function BoardCardContent({ card }: { card: BoardCard }) {
  return (
    <>
      <div className="font-medium wrap-break-word whitespace-pre-wrap">
        {card.title}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-secondary">
        <Icon.Clock className="size-3.5 fill-current" />
        {card.detail}
      </div>
    </>
  );
}

function BoardCardPreview({ card }: { card: BoardCard }) {
  return (
    <div className="min-h-10 rounded-lg border border-border-button bg-popover px-2.5 py-2 text-sm dark:border-none">
      <BoardCardContent card={card} />
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
    <Kanban.Item id={card.id} index={index} group={columnId}>
      <Kanban.ItemHandle className="float-end" aria-label="Move card">
        <Icon.DragHandle className="size-3.5 fill-current" />
      </Kanban.ItemHandle>
      <BoardCardContent card={card} />
    </Kanban.Item>
  );
}

function BoardColumnPreview({
  column,
  itemIds,
}: {
  column: BoardColumn;
  itemIds: string[];
}) {
  return (
    <div className="flex w-65 flex-col gap-2 rounded-lg bg-main p-2">
      <div className="flex items-center gap-2">
        <Badge variant={column.variant}>{column.title}</Badge>
        <span className="text-xs text-muted">{itemIds.length}</span>
      </div>
      {itemIds.map((id) => {
        const card = boardCardsById.get(id);
        return card ? <BoardCardPreview key={id} card={card} /> : null;
      })}
    </div>
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

  const [value, setValue] = useState<KanbanValue>({
    columnOrder: boardColumns.map((column) => column.id),
    items: initialBoardItems,
  });

  return (
    <div data-slot="notion-board-view" className="relative float-start px-24">
      <div className="contain-layout">
        <div
          data-block-id={blockId}
          className="relative flex min-w-full grow py-2"
        >
          <Kanban.Root
            value={value}
            onMove={(move) =>
              setValue((current) => applyKanbanMove(current, move))
            }
            renderOverlay={(source) => {
              if (source.type === KanbanDnd.Item) {
                const card = boardCardsById.get(source.id);
                return card ? <BoardCardPreview card={card} /> : null;
              }
              const column = boardColumns.find((item) => item.id === source.id);
              return column ? (
                <BoardColumnPreview
                  column={column}
                  itemIds={value.items[column.id] ?? []}
                />
              ) : null;
            }}
          >
            {(projected) =>
              projected.columnOrder.map((columnId, index) => {
                const column = boardColumns.find(
                  (item) => item.id === columnId,
                );
                if (!column) return null;

                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    index={index}
                    itemIds={projected.items[column.id] ?? []}
                  />
                );
              })
            }
          </Kanban.Root>
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;
