"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@notion-kit/cn";

//* ============================================================================
//* Context & Types
//* ============================================================================

interface Point {
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type SelectionMode = "intersect" | "contain";

interface SelectableContextValue {
  selectedIds: Set<string>;
  selectingIds: Set<string>;
  isSelecting: boolean;
  selectionRect: Rect | null;
  subscribeItem: (
    id: string,
    element: HTMLElement,
  ) => {
    unsubscribe: () => void;
  };
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const SelectableContext = createContext<SelectableContextValue | null>(null);

//* ============================================================================
//* Hooks
//* ============================================================================

export function useSelectable() {
  const ctx = useContext(SelectableContext);
  if (!ctx) {
    throw new Error("useSelectable must be used within Selectable");
  }
  return ctx;
}

export function useSelectableItem(id: string) {
  const ctx = useSelectable();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const sub = ctx.subscribeItem(id, elementRef.current);
      return () => sub.unsubscribe();
    }
  }, [id, ctx]);

  return {
    ref: elementRef,
    isSelected: ctx.selectedIds.has(id),
    isSelecting: ctx.selectingIds.has(id),
    toggle: () => ctx.toggleSelection(id),
  };
}

//* ============================================================================
//* Utilities
//* ============================================================================

function getElementRect(element: HTMLElement, container: HTMLElement): Rect {
  const elRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    x: elRect.left - containerRect.left,
    y: elRect.top - containerRect.top,
    width: elRect.width,
    height: elRect.height,
  };
}

function rectsIntersect(r1: Rect, r2: Rect, mode: SelectionMode): boolean {
  if (mode === "contain") {
    return (
      r2.x >= r1.x &&
      r2.y >= r1.y &&
      r2.x + r2.width <= r1.x + r1.width &&
      r2.y + r2.height <= r1.y + r1.height
    );
  }

  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}

//* ============================================================================
//* Main Component
//* ============================================================================

interface SelectableProps extends React.PropsWithChildren {
  mode?: SelectionMode;
  disabled?: boolean;
  multiple?: boolean;
  onSelectStart?: (e: React.PointerEvent) => void;
  onSelectMove?: (e: React.PointerEvent, selecting: Set<string>) => void;
  onSelectEnd?: (selected: Set<string>) => void;
  onSelectCancel?: () => void;
  asChild?: boolean;
  className?: string;
  activationConstraint?: {
    distance?: number;
    delay?: number;
  };
  /**
   * @prop isSelectableIntersect
   * a custom detection method
   */
  isSelectableIntersect?: (
    selectRange: { start: Point; current: Point },
    item: Rect,
    mode: SelectionMode,
  ) => boolean;
  value?: Set<string>;
  onValueChange?: (value: Set<string>) => void;
}

function Selectable({
  children,
  mode = "intersect",
  disabled = false,
  multiple = false,
  onSelectStart,
  onSelectMove,
  onSelectEnd,
  onSelectCancel,
  asChild = false,
  className,
  activationConstraint,
  isSelectableIntersect,
  value,
  onValueChange,
}: SelectableProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [uncontrolledSelectedIds, setUncontrolledSelectedIds] = useState(
    new Set<string>(),
  );
  const selectedIds = value ?? uncontrolledSelectedIds;

  const handleSetSelectedIds = useCallback(
    (next: Set<string> | ((prev: Set<string>) => Set<string>)) => {
      if (onValueChange) {
        const nextSet =
          typeof next === "function" ? next(value ?? new Set()) : next;
        onValueChange(nextSet);
      } else {
        setUncontrolledSelectedIds(next);
      }
    },
    [onValueChange, value],
  );

  const [selectingIds, setSelectingIds] = useState(new Set<string>());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [pointerDownPoint, setPointerDownPoint] = useState<Point | null>(null);
  const [activationTimer, setActivationTimer] = useState<number | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  const itemsRef = useRef(new Map<string, HTMLElement>());

  const subscribeItem = useCallback((id: string, element: HTMLElement) => {
    itemsRef.current.set(id, element);
    return {
      unsubscribe: () => itemsRef.current.delete(id),
    };
  }, []);

  const toggleSelection = useCallback(
    (id: string) => {
      handleSetSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!multiple) next.clear();
          next.add(id);
        }
        return next;
      });
    },
    [multiple, handleSetSelectedIds],
  );

  const clearSelection = useCallback(() => {
    handleSetSelectedIds(new Set());
  }, [handleSetSelectedIds]);

  const updateSelection = useCallback(
    (currentPoint: Point) => {
      if (!containerRef.current || !startPoint) return;

      const selecting = new Set<string>();

      const rect: Rect = {
        x: Math.min(startPoint.x, currentPoint.x),
        y: Math.min(startPoint.y, currentPoint.y),
        width: Math.abs(currentPoint.x - startPoint.x),
        height: Math.abs(currentPoint.y - startPoint.y),
      };

      setSelectionRect(rect);

      itemsRef.current.forEach((element, id) => {
        const itemRect = getElementRect(element, containerRef.current!);

        if (isSelectableIntersect !== undefined) {
          const range = { start: startPoint, current: currentPoint };
          if (isSelectableIntersect(range, itemRect, mode)) {
            selecting.add(id);
          }
          return;
        }

        if (rectsIntersect(rect, itemRect, mode)) {
          selecting.add(id);
        }
      });

      setSelectingIds(selecting);
    },
    [isSelectableIntersect, mode, startPoint],
  );

  const cancelActivation = useCallback(() => {
    if (activationTimer !== null) {
      clearTimeout(activationTimer);
      setActivationTimer(null);
    }
    setIsActivated(false);
    setPointerDownPoint(null);
  }, [activationTimer]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;

      const target = e.target as HTMLElement;
      // Don't start selection if pointer is on a selectable item or draggable handle
      if (
        target.closest("[data-selectable-item]") ||
        target.closest("[data-draggable-handle]") ||
        target.hasAttribute("data-draggable-handle")
      ) {
        return;
      }

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      setPointerDownPoint(point);

      // If no activation constraint, activate immediately
      if (!activationConstraint) {
        setStartPoint(point);
        setIsSelecting(true);
        setIsActivated(true);
        setSelectingIds(new Set());

        if (!multiple) {
          handleSetSelectedIds(new Set());
        }

        onSelectStart?.(e);
        e.currentTarget.setPointerCapture(e.pointerId);
      } else {
        // Handle delay constraint
        if (activationConstraint.delay) {
          const timer = window.setTimeout(() => {
            setStartPoint(point);
            setIsSelecting(true);
            setIsActivated(true);
            setSelectingIds(new Set());

            if (!multiple) {
              handleSetSelectedIds(new Set());
            }

            onSelectStart?.(e);
            e.currentTarget.setPointerCapture(e.pointerId);
          }, activationConstraint.delay);
          setActivationTimer(timer);
        } else {
          // No delay, so we're waiting for distance constraint in pointer move
          setIsActivated(false);
        }
      }
    },
    [
      disabled,
      multiple,
      onSelectStart,
      activationConstraint,
      handleSetSelectedIds,
    ],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Check distance constraint before activation
      if (pointerDownPoint && !isActivated && activationConstraint?.distance) {
        const distance = Math.sqrt(
          Math.pow(currentPoint.x - pointerDownPoint.x, 2) +
            Math.pow(currentPoint.y - pointerDownPoint.y, 2),
        );

        if (distance >= activationConstraint.distance) {
          cancelActivation();
          setStartPoint(pointerDownPoint);
          setIsSelecting(true);
          setIsActivated(true);
          setSelectingIds(new Set());

          if (!multiple) {
            handleSetSelectedIds(new Set());
          }

          onSelectStart?.(e);
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        return;
      }

      if (!isSelecting || !containerRef.current || !startPoint) return;

      updateSelection(currentPoint);
      onSelectMove?.(e, selectingIds);
    },
    [
      isSelecting,
      startPoint,
      pointerDownPoint,
      isActivated,
      updateSelection,
      selectingIds,
      onSelectMove,
      activationConstraint,
      cancelActivation,
      multiple,
      onSelectStart,
      handleSetSelectedIds,
    ],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      cancelActivation();

      if (!isSelecting) {
        setPointerDownPoint(null);
        return;
      }

      setIsSelecting(false);
      setSelectionRect(null);
      setStartPoint(null);
      setPointerDownPoint(null);

      const newSelected = new Set([...selectedIds, ...selectingIds]);
      handleSetSelectedIds(newSelected);
      setSelectingIds(new Set());

      onSelectEnd?.(newSelected);

      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [
      isSelecting,
      selectedIds,
      selectingIds,
      onSelectEnd,
      cancelActivation,
      handleSetSelectedIds,
    ],
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      cancelActivation();

      if (!isSelecting) {
        setPointerDownPoint(null);
        return;
      }

      setIsSelecting(false);
      setSelectionRect(null);
      setStartPoint(null);
      setPointerDownPoint(null);
      setSelectingIds(new Set());

      onSelectCancel?.();

      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [isSelecting, onSelectCancel, cancelActivation],
  );

  const contextValue = useMemo<SelectableContextValue>(
    () => ({
      selectedIds,
      selectingIds,
      isSelecting,
      selectionRect,
      subscribeItem,
      toggleSelection,
      clearSelection,
      setSelectedIds: handleSetSelectedIds,
    }),
    [
      clearSelection,
      isSelecting,
      selectedIds,
      selectingIds,
      selectionRect,
      subscribeItem,
      toggleSelection,
      handleSetSelectedIds,
    ],
  );

  const eventHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };

  const Comp = asChild ? Slot : "div";

  return (
    <SelectableContext value={contextValue}>
      <Comp
        ref={containerRef as React.Ref<HTMLDivElement>}
        className={cn(!asChild && "relative touch-none select-none", className)}
        {...eventHandlers}
        style={asChild ? undefined : { touchAction: "none" }}
      >
        {children}
      </Comp>
    </SelectableContext>
  );
}

//* ============================================================================
//* Overlay Component
//* ============================================================================

interface SelectableOverlayProps extends React.PropsWithChildren {
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
}

Selectable.Overlay = function SelectableOverlay({
  className,
  style,
  asChild,
  children,
}: SelectableOverlayProps) {
  const { selectionRect, isSelecting } = useSelectable();

  if (!isSelecting || !selectionRect) return null;

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    left: selectionRect.x,
    top: selectionRect.y,
    width: selectionRect.width,
    height: selectionRect.height,
    pointerEvents: "none",
    ...style,
  };

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(!asChild && "pointer-events-none absolute", className)}
      style={overlayStyle}
    >
      {asChild ? children : null}
    </Comp>
  );
};

//* ============================================================================
//* Item Component
//* ============================================================================

interface SelectableItemProps extends React.ComponentPropsWithoutRef<"div"> {
  id: string;
  asChild?: boolean;
}

Selectable.Item = function SelectableItem({
  id,
  className,
  asChild,
  ...props
}: SelectableItemProps) {
  const { ref, isSelected, isSelecting } = useSelectableItem(id);
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement>}
      data-selectable-item
      data-selected={isSelected}
      data-selecting={isSelecting}
      className={cn(!asChild && className)}
      {...props}
    />
  );
};

//* ============================================================================
//* Group Component
//* ============================================================================

interface SelectableGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

Selectable.Group = function SelectableGroup({
  className,
  asChild,
  ...props
}: SelectableGroupProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn(!asChild && className)} {...props} />;
};

export { Selectable };
export type {
  Point,
  Rect,
  SelectionMode,
  SelectableProps,
  SelectableItemProps,
  SelectableGroupProps,
  SelectableOverlayProps,
};
