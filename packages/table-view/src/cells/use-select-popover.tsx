"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useMenu } from "@notion-kit/shadcn";

import type { SelectConfig } from "../lib/types";
import { SelectMenu } from "../menus";

interface UseSelectPopoverProps {
  config: SelectConfig;
  onUpdate?: (values: string[]) => void;
}

export function useSelectPopover<T extends HTMLElement = HTMLElement>({
  config,
}: UseSelectPopoverProps) {
  const ref = useRef<T>(null);
  const { openMenu, closeMenu } = useMenu();

  const [width, setWidth] = useState(0);

  const openSelectMenu = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect();

    openMenu(
      <SelectMenu
        {...config}
        onUpdate={() => {
          closeMenu();
        }}
      />,
      {
        x: rect?.x,
        y: rect?.y,
        className:
          "max-h-[773px] min-h-[34px] w-60 overflow-visible backdrop-filter-none",
      },
    );
  }, [openMenu, config, closeMenu]);

  useLayoutEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setWidth(rect.width);
  }, []);

  return { ref, width, openSelectMenu };
}
