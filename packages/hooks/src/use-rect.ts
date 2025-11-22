"use client";

import { useLayoutEffect, useMemo, useState } from "react";

export type Rect = Omit<DOMRect, "toJSON">;
export interface UseMeasureResult<E extends Element = Element> {
  ref: (element: E) => void;
  rect: Rect;
}

const defaultState: Rect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

export function useRect<E extends Element = Element>() {
  const [element, ref] = useState<E | null>(null);
  const [rect, setRect] = useState<Rect>(defaultState);

  const observer = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return new ResizeObserver((entries) => {
      if (entries[0]) {
        const { x, y, width, height, top, left, bottom, right } =
          entries[0].target.getBoundingClientRect();
        setRect({ x, y, width, height, top, left, bottom, right });
      }
    });
  }, []);

  useLayoutEffect(() => {
    if (!element || !observer) return;
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, observer]);

  return { ref, rect };
}
