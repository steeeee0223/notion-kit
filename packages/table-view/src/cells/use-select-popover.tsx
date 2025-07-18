"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useMenu } from "@notion-kit/shadcn";

import type { SelectConfig } from "../lib/types";
import { SelectMenu } from "../menus";

interface UseSelectPopoverProps {
  propId: string;
  meta: SelectConfig;
  onUpdate?: (values: string[]) => void;
}

export function useSelectPopover<T extends HTMLElement = HTMLElement>({
  meta,
  propId,
}: UseSelectPopoverProps) {
  const ref = useRef<T>(null);
  const { openMenu } = useMenu();

  const [width, setWidth] = useState(0);

  const openSelectMenu = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect();

    openMenu(<SelectMenu propId={propId} {...meta} />, {
      x: rect?.x,
      y: rect?.y,
      className:
        "max-h-[773px] min-h-[34px] w-[300px] overflow-visible backdrop-filter-none",
    });
  }, [openMenu, propId, meta]);

  useLayoutEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setWidth(rect.width);
  }, []);

  return { ref, width, openSelectMenu };
}
