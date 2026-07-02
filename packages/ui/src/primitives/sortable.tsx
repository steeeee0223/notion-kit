import React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { UniqueIdentifier } from "@dnd-kit/abstract";
import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from "@dnd-kit/abstract/modifiers";
import { PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
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
  modifiers: UseSortableInput["modifiers"];
  orientation: Orientation;
}

const SortableRootContext =
  React.createContext<SortableRootContextValue | null>(null);

interface SortableItemState extends Record<string, unknown> {
  dragging: boolean;
  dropping: boolean;
  dragSource: boolean;
  dropTarget: boolean;
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
}

function getSortableItemsAfterDrag<
  T extends UniqueIdentifier[] | { id: UniqueIdentifier }[],
>(items: T, event: DragEndEvent) {
  if (event.canceled) return items;
  return move(items, event);
}

function SortableRoot({
  children,
  disabled = false,
  orientation = "vertical",
  sensors,
  ...props
}: SortableRootProps) {
  const context = React.useMemo<SortableRootContextValue>(
    () => ({
      disabled,
      modifiers: getSortableModifiers(orientation),
      orientation,
    }),
    [disabled, orientation],
  );

  return (
    <SortableRootContext value={context}>
      <DragDropProvider sensors={sensors ?? sortableSensors} {...props}>
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
  const sortable = useSortable({
    accept,
    alignment,
    collisionDetector,
    collisionPriority,
    data,
    disabled,
    effects,
    group,
    id,
    index,
    modifiers,
    plugins,
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
    }),
    [
      sortable.isDragging,
      sortable.isDropping,
      sortable.isDragSource,
      sortable.isDropTarget,
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

function SortableHandle({ className, ref, ...props }: SortableHandleProps) {
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
      <Icon.DragHandle className="size-3 fill-icon" />
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
