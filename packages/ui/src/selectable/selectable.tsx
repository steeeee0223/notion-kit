import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@notion-kit/cn";

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

interface SelectableProps extends useRender.ComponentProps<"div"> {
  mode?: SelectionMode;
  disabled?: boolean;
  multiple?: boolean;
  onSelectStart?: (e: React.PointerEvent) => void;
  onSelectMove?: (e: React.PointerEvent, selecting: Set<string>) => void;
  onSelectEnd?: (selected: Set<string>) => void;
  onSelectCancel?: () => void;
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
}

function Selectable({
  mode = "intersect",
  disabled = false,
  multiple = false,
  onSelectStart,
  onSelectMove,
  onSelectEnd,
  onSelectCancel,
  render,
  className,
  activationConstraint,
  isSelectableIntersect,
  ...props
}: SelectableProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
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
      setSelectedIds((prev) => {
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
    [multiple],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

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
          setSelectedIds(new Set());
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
              setSelectedIds(new Set());
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
    [disabled, multiple, onSelectStart, activationConstraint],
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
            setSelectedIds(new Set());
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
      setSelectedIds(newSelected);
      setSelectingIds(new Set());

      onSelectEnd?.(newSelected);

      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [isSelecting, selectedIds, selectingIds, onSelectEnd, cancelActivation],
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
      setSelectedIds,
    }),
    [
      clearSelection,
      isSelecting,
      selectedIds,
      selectingIds,
      selectionRect,
      subscribeItem,
      toggleSelection,
    ],
  );

  const element = useRender({
    defaultTagName: "div",
    render,
    ref: containerRef,
    props: mergeProps(
      {
        className: cn("relative touch-none select-none", className),
        style: { touchAction: "none" },
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
      },
      props,
    ),
  });

  return <SelectableContext value={contextValue}>{element}</SelectableContext>;
}

Selectable.Overlay = function SelectableOverlay({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const { selectionRect, isSelecting } = useSelectable();

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    left: selectionRect?.x,
    top: selectionRect?.y,
    width: selectionRect?.width,
    height: selectionRect?.height,
    pointerEvents: "none",
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        className: cn("pointer-events-none absolute", className),
        style: overlayStyle,
      },
      props,
    ),
    enabled: isSelecting && !!selectionRect,
  });
};

interface SelectableItemProps extends useRender.ComponentProps<"div"> {
  id: string;
}

Selectable.Item = function SelectableItem({
  id,
  render,
  ...props
}: SelectableItemProps) {
  const { ref, isSelected, isSelecting } = useSelectableItem(id);

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps(
      {
        "data-selectable-item": true,
        "data-selected": isSelected,
        "data-selecting": isSelecting,
      },
      props,
    ),
  });
};

Selectable.Group = function SelectableGroup({
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({ defaultTagName: "div", render, props });
};

export { Selectable };
export type {
  Point,
  Rect,
  SelectionMode,
  SelectableProps,
  SelectableItemProps,
};
