import React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { UniqueIdentifier } from "@dnd-kit/abstract";
import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from "@dnd-kit/abstract/modifiers";
import {
  Feedback,
  PointerActivationConstraints,
  PointerSensor,
  type DropAnimation,
} from "@dnd-kit/dom";
import { RestrictToElement } from "@dnd-kit/dom/modifiers";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/react";
import { useSortable, type UseSortableInput } from "@dnd-kit/react/sortable";
import { createPortal } from "react-dom";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Button, type ButtonProps } from "./button";
import { composeRefs } from "./compose-refs";

type Orientation = "horizontal" | "vertical";

interface SortableRootContextValue {
  disabled: boolean;
  draggedIds: ReadonlySet<UniqueIdentifier>;
  modifiers: UseSortableInput["modifiers"];
  multiDrag?: { selectedIds: UniqueIdentifier[] };
  orientation: Orientation;
}

const SortableRootContext =
  React.createContext<SortableRootContextValue | null>(null);

interface SortableItemState extends Record<string, unknown> {
  dragging: boolean;
  dropping: boolean;
  dragSource: boolean;
  dropTarget: boolean;
  groupDragging: boolean;
}

interface SortableItemContextValue extends SortableItemState {
  handleRef: (element: Element | null) => void;
}

const SortableItemContext =
  React.createContext<SortableItemContextValue | null>(null);

const sortableSensors: React.ComponentProps<
  typeof DragDropProvider
>["sensors"] = (defaults) => [
  ...defaults.filter((sensor) => sensor !== PointerSensor),
  PointerSensor.configure({
    activationConstraints(event) {
      return event.pointerType === "touch"
        ? [
            new PointerActivationConstraints.Delay({
              value: 250,
              tolerance: { x: 5, y: 5 },
            }),
          ]
        : [new PointerActivationConstraints.Distance({ value: 5 })];
    },
  }),
];

function getSortableModifiers(orientation: Orientation) {
  return [
    orientation === "vertical"
      ? RestrictToVerticalAxis
      : RestrictToHorizontalAxis,
    RestrictToElement.configure({
      element: (operation) => operation.source?.element?.parentElement ?? null,
    }),
  ];
}

interface SortableRootProps
  extends React.ComponentProps<typeof DragDropProvider> {
  orientation?: Orientation;
  disabled?: boolean;
  multiDrag?: { selectedIds: UniqueIdentifier[] };
}

function getSortableItemId(item: UniqueIdentifier | { id: UniqueIdentifier }) {
  return typeof item === "object" ? item.id : item;
}

function getMultiDragSelectedIds(data: unknown) {
  if (!data || typeof data !== "object") return undefined;
  const dataRecord = data as Record<string, unknown>;
  if (!("notionKitSortable" in dataRecord)) return undefined;

  const metadata = dataRecord.notionKitSortable;
  if (!metadata || typeof metadata !== "object") return undefined;

  const selectedIds = (metadata as Record<string, unknown>).selectedIds;
  if (
    !Array.isArray(selectedIds) ||
    selectedIds.some((id) => typeof id !== "string" && typeof id !== "number")
  ) {
    return undefined;
  }
  return selectedIds as UniqueIdentifier[];
}

function getItemsAfterMultiDrag<
  T extends UniqueIdentifier[] | { id: UniqueIdentifier }[],
>(items: T, source: NonNullable<DragEndEvent["operation"]["source"]>) {
  const selectedIds = getMultiDragSelectedIds(source.data);
  if (!selectedIds || selectedIds.length === 0) return null;

  const selectedIdSet = new Set(selectedIds);
  const selectedItems = items.filter((item) =>
    selectedIdSet.has(getSortableItemId(item)),
  );
  if (
    selectedItems.length <= 1 ||
    selectedItems.length !== selectedIdSet.size ||
    !selectedIdSet.has(source.id)
  )
    return null;

  const sourceIndex = "index" in source ? source.index : undefined;
  const initialIndex =
    "initialIndex" in source ? source.initialIndex : undefined;
  if (typeof sourceIndex !== "number" || typeof initialIndex !== "number")
    return null;
  if (sourceIndex === initialIndex) return items;

  const selectedBeforeTarget = items
    .slice(0, sourceIndex)
    .filter((item) => selectedIdSet.has(getSortableItemId(item))).length;
  const remainingItems = items.filter(
    (item) => !selectedIdSet.has(getSortableItemId(item)),
  );
  const targetIndex = Math.min(
    Math.max(sourceIndex - selectedBeforeTarget, 0),
    remainingItems.length,
  );

  return [
    ...remainingItems.slice(0, targetIndex),
    ...selectedItems,
    ...remainingItems.slice(targetIndex),
  ] as T;
}

function getSortableItemsAfterDrag<
  T extends UniqueIdentifier[] | { id: UniqueIdentifier }[],
>(items: T, event: DragEndEvent) {
  if (event.canceled) return items;

  const { activatorEvent, source, target, transform } = event.operation;
  if (source) {
    const multiDragItems = getItemsAfterMultiDrag(items, source);
    if (multiDragItems) return multiDragItems;
  }
  const hasProjectedIndex =
    source != null &&
    "initialIndex" in source &&
    typeof source.initialIndex === "number" &&
    "index" in source &&
    typeof source.index === "number" &&
    source.index !== source.initialIndex;
  if (
    source?.id != null &&
    target?.id === source.id &&
    !hasProjectedIndex &&
    typeof KeyboardEvent !== "undefined" &&
    activatorEvent instanceof KeyboardEvent &&
    (transform.x !== 0 || transform.y !== 0)
  ) {
    const sourceIndex = items.findIndex((item) =>
      typeof item === "object" ? item.id === source.id : item === source.id,
    );
    const direction =
      Math.abs(transform.x) >= Math.abs(transform.y)
        ? Math.sign(transform.x)
        : Math.sign(transform.y);
    const targetIndex = Math.min(
      Math.max(sourceIndex + direction, 0),
      items.length - 1,
    );
    if (sourceIndex >= 0 && targetIndex !== sourceIndex) {
      const next = [...items] as (
        | UniqueIdentifier
        | { id: UniqueIdentifier }
      )[];
      const [item] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, item!);
      return next as T;
    }
  }

  return move(items, event);
}

function SortableRoot({
  children,
  disabled = false,
  multiDrag,
  onDragEnd,
  onDragStart,
  orientation = "vertical",
  sensors,
  ...props
}: SortableRootProps) {
  const [draggedIds, setDraggedIds] = React.useState<UniqueIdentifier[]>([]);
  const handleDragStart = React.useCallback<
    NonNullable<SortableRootProps["onDragStart"]>
  >(
    (event, manager) => {
      const sourceId = event.operation.source?.id;
      if (sourceId != null) {
        setDraggedIds(
          multiDrag?.selectedIds.includes(sourceId)
            ? multiDrag.selectedIds
            : [sourceId],
        );
      }
      onDragStart?.(event, manager);
    },
    [multiDrag?.selectedIds, onDragStart],
  );
  const handleDragEnd = React.useCallback<
    NonNullable<SortableRootProps["onDragEnd"]>
  >(
    (event, manager) => {
      onDragEnd?.(event, manager);
      setDraggedIds([]);
    },
    [onDragEnd],
  );
  const context = React.useMemo<SortableRootContextValue>(
    () => ({
      disabled,
      draggedIds: new Set(draggedIds),
      modifiers: getSortableModifiers(orientation),
      multiDrag,
      orientation,
    }),
    [disabled, draggedIds, multiDrag, orientation],
  );

  return (
    <SortableRootContext value={context}>
      <DragDropProvider
        sensors={sensors ?? sortableSensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        {...props}
      >
        {children}
      </DragDropProvider>
    </SortableRootContext>
  );
}

interface SortableListProps extends useRender.ComponentProps<"div"> {
  orientation?: Orientation;
}

function SortableList({
  className,
  orientation: orientationProp,
  render,
  ...props
}: SortableListProps) {
  const root = React.useContext(SortableRootContext);
  const orientation = orientationProp ?? root?.orientation;

  if (!orientation) {
    throw new Error(
      "Sortable.List requires an orientation outside Sortable.Root",
    );
  }

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        "data-slot": "sortable-list",
        "data-orientation": orientation,
        className: cn(
          "relative flex",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className,
        ),
      },
      props,
    ),
  });
}

type SortableItemOptions = Omit<
  UseSortableInput,
  "element" | "handle" | "id" | "index" | "target"
>;

type SortableItemProps = Omit<
  useRender.ComponentProps<"div", SortableItemState>,
  "id"
> &
  SortableItemOptions & {
    dropAnimation?: DropAnimation | null;
    id: UniqueIdentifier;
    index: number;
  };

function SortableItem({
  accept,
  alignment,
  className,
  collisionDetector,
  collisionPriority,
  data,
  dropAnimation,
  effects,
  group,
  id,
  index,
  plugins,
  register,
  render,
  sensors,
  transition,
  type,
  ...props
}: SortableItemProps) {
  const root = React.useContext(SortableRootContext);
  const disabled = props.disabled ?? root?.disabled;
  const modifiers = props.modifiers ?? root?.modifiers;
  const sortableData = React.useMemo(() => {
    if (!root?.multiDrag) return data;

    const selectedIds = root.multiDrag.selectedIds.includes(id)
      ? root.multiDrag.selectedIds
      : [id];
    const userMetadata =
      data?.notionKitSortable && typeof data.notionKitSortable === "object"
        ? data.notionKitSortable
        : {};
    return {
      ...data,
      notionKitSortable: { ...userMetadata, selectedIds },
    };
  }, [data, id, root?.multiDrag]);
  const sortablePlugins = React.useMemo(() => {
    if (dropAnimation === undefined) return plugins;

    return (defaults) => [
      Feedback.configure({ dropAnimation }),
      ...(typeof plugins === "function"
        ? plugins(defaults)
        : (plugins ?? defaults)),
    ];
  }, [dropAnimation, plugins]);
  const sortable = useSortable({
    accept,
    alignment,
    collisionDetector,
    collisionPriority,
    data: sortableData,
    disabled,
    effects,
    group,
    id,
    index,
    modifiers,
    plugins: sortablePlugins,
    register,
    sensors,
    transition,
    type,
  });
  const state = React.useMemo<SortableItemState>(
    () => ({
      dragging: sortable.isDragging,
      dropping: sortable.isDropping,
      dragSource: sortable.isDragSource,
      dropTarget: sortable.isDropTarget,
      groupDragging: root?.draggedIds.has(id) ?? false,
    }),
    [
      sortable.isDragging,
      sortable.isDropping,
      sortable.isDragSource,
      sortable.isDropTarget,
      root?.draggedIds,
      id,
    ],
  );
  const context = React.useMemo<SortableItemContextValue>(
    () => ({ ...state, handleRef: sortable.handleRef }),
    [sortable.handleRef, state],
  );
  const element = useRender({
    defaultTagName: "div",
    render,
    ref: sortable.ref,
    state,
    props: mergeProps(
      {
        "data-slot": "sortable-item",
        "data-group-dragging": state.groupDragging || undefined,
        className: cn(
          "relative cursor-grab data-dragging:z-50 data-dragging:cursor-grabbing data-dragging:opacity-80",
          className,
        ),
      },
      props,
    ),
  });

  return <SortableItemContext value={context}>{element}</SortableItemContext>;
}

type SortableHandleProps = ButtonProps;

function SortableHandle({
  className,
  ref,
  children,
  ...props
}: SortableHandleProps) {
  const item = React.useContext(SortableItemContext);
  if (!item) {
    throw new Error("Sortable.Handle must be used inside Sortable.Item");
  }

  return (
    <Button
      ref={composeRefs(item.handleRef, ref)}
      type="button"
      variant="hint"
      data-slot="sortable-handle"
      aria-label="Drag item"
      className={cn(
        "shrink-0 cursor-grab touch-none fill-icon! active:cursor-grabbing",
        className,
      )}
      {...props}
    >
      {children ?? <Icon.DragHandle className="size-3 fill-icon" />}
    </Button>
  );
}

interface SortableOverlayProps
  extends React.ComponentProps<typeof DragOverlay> {
  container?: Element | DocumentFragment | null;
}

function SortableOverlay({
  container,
  dropAnimation = null,
  ...props
}: SortableOverlayProps) {
  const overlay = <DragOverlay dropAnimation={dropAnimation} {...props} />;
  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, container ?? document.body);
}

const Sortable = {
  Handle: SortableHandle,
  Item: SortableItem,
  List: SortableList,
  Overlay: SortableOverlay,
  Root: SortableRoot,
};

export {
  getSortableItemsAfterDrag,
  Sortable,
  SortableHandle,
  SortableItem,
  SortableList,
  SortableOverlay,
  SortableRoot,
};
export type {
  Orientation as SortableOrientation,
  SortableHandleProps,
  SortableItemProps,
  SortableItemState,
  SortableListProps,
  SortableOverlayProps,
  SortableRootProps,
};
