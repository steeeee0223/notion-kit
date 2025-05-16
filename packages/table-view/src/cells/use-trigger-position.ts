"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface Position {
  top: number;
  left: number;
}

export const useTriggerPosition = () => {
  const ref = useRef<HTMLDivElement>(null);
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
};
