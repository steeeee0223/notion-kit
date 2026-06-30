import React, { useState } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

enum KanbanDnd {
  Item = "item",
  Column = "column",
}

type InferProps<T> = T extends (props: infer P) => React.JSX.Element
  ? P
  : never;

type KanbanProviderProps = InferProps<typeof DragDropProvider>;

export function KanbanProvider({
  children,
  onDragOver,
  ...props
}: KanbanProviderProps) {
  return (
    <DragDropProvider onDragOver={onDragOver} {...props}>
      <div data-slot="kanban" className="flex items-start gap-3">
        {children}
      </div>
    </DragDropProvider>
  );
}

interface KanbanColumnProps extends React.PropsWithChildren {
  id: string;
  index: number;
}

export function KanbanColumn({ id, index, children }: KanbanColumnProps) {
  const { ref, isDropTarget } = useSortable({
    id,
    index,
    type: KanbanDnd.Column,
    accept: [KanbanDnd.Item, KanbanDnd.Column],
    collisionPriority: CollisionPriority.Low,
    modifiers: [RestrictToHorizontalAxis],
  });
  const style = isDropTarget ? { background: "#00000030" } : undefined;

  return (
    <div
      data-slot="kanban-column"
      ref={ref}
      style={style}
      className="w-40 rounded-lg"
    >
      <div className="mb-3">{id}</div>
      <div className="flex h-120 flex-col gap-3 rounded-lg bg-yellow-600 p-4">
        {children}
      </div>
    </div>
  );
}

interface KanbanItemProps extends React.PropsWithChildren {
  id: string;
  index: number;
  groupId: string;
}

export function KanbanItem({ id, index, groupId, children }: KanbanItemProps) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: KanbanDnd.Item,
    accept: KanbanDnd.Item,
    group: groupId,
  });

  return (
    <div
      data-slot="kanban-item"
      ref={ref}
      data-dragging={isDragging}
      className="flex items-center justify-center rounded-lg bg-orange-400 p-4 text-white data-dragging:bg-orange-200"
    >
      {children ?? id}
    </div>
  );
}

export function KanbanDemo() {
  const [items, setItems] = useState<Record<string, string[]>>({
    A: ["A0", "A1", "A2"],
    B: ["B0", "B1"],
    C: [],
  });
  const [columnOrder, setColumnOrder] = useState(() => Object.keys(items));

  return (
    <KanbanProvider
      onDragOver={(event) => {
        const { source, target } = event.operation;

        if (source?.type === "column") return;

        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        const { source, target } = event.operation;

        if (event.canceled || source?.type !== "column") return;

        setColumnOrder((columns) => move(columns, event));
      }}
    >
      {columnOrder.map((column, columnIndex) => (
        <KanbanColumn key={column} id={column} index={columnIndex}>
          {items[column]?.map((id, index) => (
            <KanbanItem key={id} id={id} index={index} groupId={column} />
          ))}
        </KanbanColumn>
      ))}
    </KanbanProvider>
  );
}
