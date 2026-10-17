import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CollisionPriority, type CollisionDetector } from "@dnd-kit/abstract";
import {
  defaultCollisionDetection,
  pointerIntersection,
} from "@dnd-kit/collision";
import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { OptimisticSortingPlugin } from "@dnd-kit/dom/sortable";
import {
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/react";
import z from "zod";

import { cn } from "@notion-kit/cn";

import { composeRefs, Sortable } from "@/primitives";

enum KanbanDnd {
  Item = "item",
  Column = "column",
  ColumnContent = "column-content",
}

type KanbanItems = Record<string, string[]>;
interface KanbanValue {
  columnOrder: string[];
  items: KanbanItems;
}
type KanbanSource =
  | { type: KanbanDnd.Item; id: string }
  | { type: KanbanDnd.Column; id: string };
type KanbanMove =
  | {
      type: KanbanDnd.Item;
      id: string;
      columnId: string;
      beforeId: string | null;
    }
  | { type: KanbanDnd.Column; id: string; beforeId: string | null };

function findItemColumn(value: KanbanValue, id: string) {
  return value.columnOrder.find((columnId) =>
    value.items[columnId]?.includes(id),
  );
}

function insertBefore(ids: string[], id: string, beforeId: string | null) {
  const next = ids.filter((item) => item !== id);
  next.splice(beforeId === null ? next.length : next.indexOf(beforeId), 0, id);
  return next;
}

function applyKanbanMove(value: KanbanValue, move: KanbanMove): KanbanValue {
  if (move.beforeId === move.id) return value;
  if (move.type === KanbanDnd.Column) {
    if (
      !value.columnOrder.includes(move.id) ||
      (move.beforeId !== null && !value.columnOrder.includes(move.beforeId))
    )
      return value;
    const columnOrder = insertBefore(value.columnOrder, move.id, move.beforeId);
    return columnOrder.every((id, index) => id === value.columnOrder[index])
      ? value
      : { ...value, columnOrder };
  }
  const origin = findItemColumn(value, move.id);
  const destination = value.items[move.columnId];
  if (
    !origin ||
    !destination ||
    !value.columnOrder.includes(move.columnId) ||
    (move.beforeId !== null && !destination.includes(move.beforeId))
  )
    return value;
  const nextDestination = insertBefore(destination, move.id, move.beforeId);
  if (
    origin === move.columnId &&
    nextDestination.every((id, index) => id === destination[index])
  )
    return value;
  return {
    ...value,
    items: {
      ...value.items,
      [origin]: value.items[origin]!.filter((id) => id !== move.id),
      [move.columnId]: nextDestination,
    },
  };
}

interface KanbanSession {
  source: KanbanSource;
  placement: KanbanMove | null;
  initialValue: KanbanValue;
  contextKey: string | undefined;
}

function sameIds(a: KanbanValue, b: KanbanValue) {
  return (
    a.columnOrder.length === b.columnOrder.length &&
    a.columnOrder.every(
      (id, index) =>
        id === b.columnOrder[index] &&
        a.items[id]?.length === b.items[id]?.length &&
        a.items[id]?.every(
          (item, itemIndex) => item === b.items[id]?.[itemIndex],
        ),
    )
  );
}

const columnTargetSchema = z.object({ columnId: z.string() });
function resolveMove(
  value: KanbanValue,
  source: KanbanSource,
  event: DragOverEvent | DragEndEvent,
): KanbanMove | null {
  const { target, position, activatorEvent } = event.operation;
  if (!target || target.disabled) return null;
  const id = String(target.id);
  const keyboard = activatorEvent instanceof KeyboardEvent;
  if (source.type === KanbanDnd.Column) {
    if (target.type !== KanbanDnd.Column || !value.columnOrder.includes(id))
      return null;
    const index = value.columnOrder.indexOf(id);
    const after =
      id === source.id ||
      (keyboard
        ? value.columnOrder.indexOf(source.id) < index
        : target.shape && position.current.x > target.shape.center.x);
    return {
      ...source,
      beforeId: after
        ? (value.columnOrder.slice(index + 1).find((id) => id !== source.id) ??
          null)
        : id,
    };
  }
  if (target.type === KanbanDnd.ColumnContent) {
    const result = columnTargetSchema.safeParse(target.data);
    return result.success && value.columnOrder.includes(result.data.columnId)
      ? { ...source, columnId: result.data.columnId, beforeId: null }
      : null;
  }
  if (target.type !== KanbanDnd.Item) return null;
  const columnId = findItemColumn(value, id);
  if (!columnId) return null;
  const ids = value.items[columnId]!;
  const index = ids.indexOf(id);
  const sourceIndex = ids.indexOf(source.id);
  const after =
    id === source.id ||
    (keyboard
      ? sourceIndex >= 0 && sourceIndex < index
      : target.shape && position.current.y > target.shape.center.y);
  const beforeId = after
    ? (ids.slice(index + 1).find((item) => item !== source.id) ?? null)
    : id;
  return { ...source, columnId, beforeId };
}

// Pointer placement follows the column under the pointer, not adjacent shape overlap.
const kanbanCollisionDetector: CollisionDetector = (input) =>
  input.dragOperation.activatorEvent instanceof KeyboardEvent
    ? defaultCollisionDetection(input)
    : pointerIntersection(input);

const kanbanPlugins: React.ComponentProps<typeof Sortable.Item>["plugins"] = (
  defaults,
) => defaults.filter((plugin) => plugin !== OptimisticSortingPlugin);
const kanbanSensors: React.ComponentProps<typeof Sortable.Root>["sensors"] = (
  defaults,
) => [
  ...defaults.filter((sensor) => sensor !== PointerSensor),
  PointerSensor.configure({
    activatorElements: (source) => [
      source.type === KanbanDnd.Item
        ? source.element
        : (source.handle ?? source.element),
    ],
    activationConstraints: (event) =>
      event.pointerType === "touch"
        ? [
            new PointerActivationConstraints.Delay({
              value: 250,
              tolerance: { x: 5, y: 5 },
            }),
          ]
        : [new PointerActivationConstraints.Distance({ value: 5 })],
  }),
];

const KanbanSessionContext = createContext<KanbanSource | null>(null);
const KanbanFocusContext =
  createContext<React.RefObject<KanbanSource | null> | null>(null);
interface KanbanRootProps
  extends Omit<
    React.ComponentProps<typeof Sortable.Root>,
    "children" | "onDragStart" | "onDragOver" | "onDragMove" | "onDragEnd"
  > {
  value: KanbanValue;
  children: (projectedValue: KanbanValue) => React.ReactNode;
  onMove: (move: KanbanMove) => void;
  canMove?: (move: KanbanMove) => boolean;
  renderOverlay: (source: KanbanSource) => React.ReactNode;
  contextKey?: string;
}
function KanbanRoot({
  value,
  children,
  onMove,
  canMove,
  renderOverlay,
  contextKey,
  ...props
}: KanbanRootProps) {
  const [session, setSession] = useState<KanbanSession | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const suppressClick = useRef(false);
  const focusSource = useRef<KanbanSource | null>(null);
  useEffect(() => {
    if (!focusSource.current) return;
    const frame = requestAnimationFrame(() => {
      const source = focusSource.current;
      if (!source) return;
      const node = [
        ...(listRef.current?.querySelectorAll<HTMLElement>(
          "[data-kanban-id]",
        ) ?? []),
      ].find((node) => node.dataset.kanbanId === source.id);
      const handle =
        node?.querySelector<HTMLElement>(
          '[data-slot="sortable-handle"], [data-slot="kanban-column-header"]',
        ) ?? node;
      handle?.focus();
      focusSource.current = null;
    });
    return () => cancelAnimationFrame(frame);
  });
  const validSession =
    session &&
    !props.disabled &&
    session.contextKey === contextKey &&
    sameIds(session.initialValue, value)
      ? session
      : null;
  // Authoritative membership/configuration changes invalidate a gesture permanently.
  if (session && !validSession) setSession(null);
  const projected = validSession?.placement
    ? applyKanbanMove(value, validSession.placement)
    : value;
  function placement(event: DragOverEvent | DragEndEvent) {
    if (!validSession) return null;
    const move = resolveMove(projected, validSession.source, event);
    return move && (canMove?.(move) ?? true) ? move : null;
  }
  function preview(event: DragOverEvent) {
    const move = placement(event);
    if (!validSession) return;
    const previous = validSession.placement;
    if (
      previous?.type === move?.type &&
      previous?.id === move?.id &&
      previous?.beforeId === move?.beforeId &&
      (previous?.type !== KanbanDnd.Item ||
        (move?.type === KanbanDnd.Item && previous.columnId === move.columnId))
    )
      return;
    setSession({ ...validSession, placement: move });
  }
  return (
    <Sortable.Root
      orientation="horizontal"
      sensors={kanbanSensors}
      {...props}
      onDragStart={(event) => {
        const source = event.operation.source;
        if (
          props.disabled ||
          !source ||
          (source.type !== KanbanDnd.Item && source.type !== KanbanDnd.Column)
        )
          return;
        const active = {
          type: source.type,
          id: String(source.id),
        } as KanbanSource;
        if (
          active.type === KanbanDnd.Item
            ? !findItemColumn(value, active.id)
            : !value.columnOrder.includes(active.id)
        )
          return;
        suppressClick.current = true;
        setSession({
          source: active,
          placement: null,
          initialValue: value,
          contextKey,
        });
      }}
      onDragOver={preview}
      onDragMove={(event) => preview(event)}
      onDragEnd={(event) => {
        const move = event.canceled ? null : placement(event);
        const source = validSession?.source;
        setSession(null);
        if (move && applyKanbanMove(value, move) !== value) onMove(move);
        if (source && event.operation.activatorEvent instanceof KeyboardEvent) {
          focusSource.current = source;
        }
        // Consume the synthetic click from the pointer-up that finished this gesture.
        setTimeout(() => {
          suppressClick.current = false;
        }, 0);
      }}
    >
      <KanbanFocusContext value={focusSource}>
        <KanbanSessionContext value={validSession?.source ?? null}>
          <Sortable.List
            ref={listRef}
            data-slot="kanban"
            className="min-w-max items-start gap-3"
            onClickCapture={(event) => {
              if (suppressClick.current) {
                event.preventDefault();
                event.stopPropagation();
              }
            }}
          >
            {children(projected)}
          </Sortable.List>
          <Sortable.Overlay dropAnimation={null}>
            {validSession ? (
              <div
                data-slot="kanban-overlay"
                aria-hidden="true"
                className="pointer-events-none"
                inert
              >
                {renderOverlay(validSession.source)}
              </div>
            ) : null}
          </Sortable.Overlay>
        </KanbanSessionContext>
      </KanbanFocusContext>
    </Sortable.Root>
  );
}

const KanbanColumnContext = createContext<string | null>(null);
interface KanbanColumnProps extends React.ComponentProps<typeof Sortable.Item> {
  id: string;
}
function KanbanColumn({ id, className, ...props }: KanbanColumnProps) {
  return (
    <KanbanColumnContext value={id}>
      <Sortable.Item
        {...props}
        data-slot="kanban-column"
        data-kanban-id={id}
        id={id}
        type={KanbanDnd.Column}
        accept={KanbanDnd.Column}
        plugins={kanbanPlugins}
        collisionDetector={kanbanCollisionDetector}
        className={cn(
          "group/kanban-column mb-4 box-content flex h-max w-65 shrink-0 flex-col items-center gap-2 rounded-lg p-2 text-sm",
          "data-dragging:z-10 data-dragging:bg-default/5",
          className,
        )}
      />
    </KanbanColumnContext>
  );
}
function KanbanColumnHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Sortable.Handle
      data-slot="kanban-column-header"
      render={
        <div
          className={cn("flex w-full hover:bg-transparent", className)}
          {...props}
        />
      }
    />
  );
}
function KanbanColumnContent({
  className,
  ...props
}: React.ComponentProps<typeof Sortable.List>) {
  const id = use(KanbanColumnContext);
  if (id === null)
    throw new Error("Kanban.ColumnContent requires Kanban.Column");
  const { ref } = useDroppable({
    id: `content:${id}`,
    type: KanbanDnd.ColumnContent,
    accept: KanbanDnd.Item,
    collisionPriority: CollisionPriority.Low,
    collisionDetector: kanbanCollisionDetector,
    data: { columnId: id },
  });
  return (
    <Sortable.List
      {...props}
      data-slot="kanban-column-content"
      orientation="vertical"
      ref={ref}
      className={cn("min-h-10 w-full gap-2", className)}
    />
  );
}
interface KanbanItemProps extends React.ComponentProps<typeof Sortable.Item> {
  id: string;
  group: string;
}
function KanbanItem({
  id,
  group,
  className,
  children,
  ...props
}: KanbanItemProps) {
  const source = use(KanbanSessionContext);
  const active = source?.type === KanbanDnd.Item && source.id === id;
  return (
    <Sortable.Item
      {...props}
      data-slot="kanban-item"
      data-kanban-id={id}
      data-placeholder={active || undefined}
      id={id}
      group={group}
      type={KanbanDnd.Item}
      accept={KanbanDnd.Item}
      data={{ columnId: group }}
      modifiers={[]}
      plugins={kanbanPlugins}
      collisionDetector={kanbanCollisionDetector}
      className={cn(
        "group/card static block h-full min-h-10 animate-bg-in overflow-hidden rounded-lg border border-border-button bg-popover px-2.5 py-2 text-inherit select-none hover:bg-default/5 dark:border-none",
        active && "bg-default/5",
        className,
      )}
    >
      <div
        className={active ? "invisible" : undefined}
        inert={active || undefined}
      >
        {children}
      </div>
    </Sortable.Item>
  );
}
function KanbanItemHandle({
  ref,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof Sortable.Handle>) {
  const handleRef = useRef<HTMLButtonElement>(null);
  const focusSource = use(KanbanFocusContext);
  useLayoutEffect(() => {
    const handle = handleRef.current;
    return () => {
      const id =
        handle?.closest<HTMLElement>("[data-kanban-id]")?.dataset.kanbanId;
      // A controlled acceptance may reparent the focused card after the gesture ends.
      if (id && handle === document.activeElement && focusSource) {
        focusSource.current = { type: KanbanDnd.Item, id };
      }
    };
  }, [focusSource]);
  return (
    <Sortable.Handle
      aria-label="Move card"
      {...props}
      ref={composeRefs(handleRef, ref)}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        onKeyDown?.(event);
      }}
    />
  );
}
const Kanban = {
  Column: KanbanColumn,
  ColumnContent: KanbanColumnContent,
  ColumnHeader: KanbanColumnHeader,
  Item: KanbanItem,
  ItemHandle: KanbanItemHandle,
  Root: KanbanRoot,
};
export {
  applyKanbanMove,
  Kanban,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
  KanbanDnd,
  KanbanItem,
  KanbanItemHandle,
  KanbanRoot,
};
export type {
  KanbanColumnProps,
  KanbanItemProps,
  KanbanItems,
  KanbanMove,
  KanbanRootProps,
  KanbanSource,
  KanbanValue,
};
