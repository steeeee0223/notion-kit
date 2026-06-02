import * as React from "react";

export interface Vector {
  x: number;
  y: number;
}

interface LayoutOffsetChange {
  currentPosition: Vector;
  nextLayoutOffset: Vector;
  previousLayoutOffset: Vector;
}

interface VisualPositionChange {
  nextLayoutOffset: Vector;
  visualPosition: Vector;
}

interface RectLike {
  height: number;
  left: number;
  top: number;
  width: number;
}

function hasDisplacedPosition(position: Vector) {
  return position.x !== 0 || position.y !== 0;
}

export function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    const cleanups: (() => void)[] = [];

    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        const cleanup = ref(node);
        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
        return;
      }

      ref.current = node;
      if (node !== null) {
        cleanups.push(() => {
          ref.current = null;
        });
      }
    });

    if (node === null || cleanups.length === 0) return;

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  };
}

export function useComposedRefs<T>(
  firstRef: React.Ref<T> | undefined,
  secondRef: React.Ref<T> | undefined,
) {
  return React.useMemo(
    () => composeRefs(firstRef, secondRef),
    [firstRef, secondRef],
  );
}

export function getPositionAfterLayoutOffsetChange({
  currentPosition,
  nextLayoutOffset,
  previousLayoutOffset,
}: LayoutOffsetChange) {
  if (!hasDisplacedPosition(currentPosition)) {
    return currentPosition;
  }

  return {
    x: currentPosition.x + previousLayoutOffset.x - nextLayoutOffset.x,
    y: currentPosition.y + previousLayoutOffset.y - nextLayoutOffset.y,
  };
}

export function getPositionAfterVisualPositionPreserved({
  nextLayoutOffset,
  visualPosition,
}: VisualPositionChange) {
  return {
    x: visualPosition.x - nextLayoutOffset.x,
    y: visualPosition.y - nextLayoutOffset.y,
  };
}

export function getPositioningReferenceOrigin({
  boundsRect,
  rootRect,
}: {
  boundsRect?: RectLike | null;
  rootRect?: RectLike | null;
}) {
  if (rootRect && (rootRect.width > 0 || rootRect.height > 0)) {
    return { x: rootRect.left, y: rootRect.top };
  }

  if (boundsRect) {
    return { x: boundsRect.left, y: boundsRect.top };
  }

  return { x: 0, y: 0 };
}
