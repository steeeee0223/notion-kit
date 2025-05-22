"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface Position {
  top: number;
  left: number;
}

export function useTriggerPosition<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setPosition({ top: rect.height, left: rect.left });
      setWidth(rect.width);
    }
  }, []);

  return { ref, position, width };
}
