import { useId, useRef, useState } from "react";
import { Feedback } from "@dnd-kit/dom";

import { Icon } from "@notion-kit/icons";
import {
  getKanbanItemsAfterDrag,
  Kanban,
  KanbanDnd,
  KanbanItems,
} from "@notion-kit/ui/kanban";
import {
  Badge,
  Button,
  getSortableItemsAfterDrag,
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
      plugins={[Feedback.configure({ feedback: "clone" })]}
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
  const snapshotRef = useRef<KanbanItems | null>(null);

  return (
    <div data-slot="notion-board-view" className="relative float-start px-24">
      <div className="contain-layout">
        <div
          data-block-id={blockId}
          className="relative flex min-w-full grow py-2"
        >
          <Kanban.Root
            onDragStart={(e) => {
              if (e.operation.source?.type !== KanbanDnd.Item) return;
              snapshotRef.current = items;
            }}
            onDragOver={(e) => {
              if (e.operation.source?.type !== KanbanDnd.Item) return;
              setItems((v) => getKanbanItemsAfterDrag(v, e));
            }}
            onDragEnd={(e) => {
              const sourceType = e.operation.source?.type;
              if (sourceType === KanbanDnd.Column) {
                setColumnOrder((v) => getSortableItemsAfterDrag(v, e));
                return;
              }
              if (
                sourceType === KanbanDnd.Item &&
                e.canceled &&
                snapshotRef.current
              ) {
                setItems(snapshotRef.current);
              }
              snapshotRef.current = null;
            }}
          >
            {columnOrder.map((columnId, index) => {
              const column = boardColumns.find((item) => item.id === columnId);
              if (!column) return null;

              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  index={index}
                  itemIds={items[column.id] ?? []}
                />
              );
            })}
          </Kanban.Root>
        </div>
      </div>
    </div>
  );
}
