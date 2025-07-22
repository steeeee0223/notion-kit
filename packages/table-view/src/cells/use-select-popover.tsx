"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { MenuProvider, useMenu } from "@notion-kit/shadcn";

import { SelectMenu } from "../menus";

interface UseSelectPopoverProps {
  propId: string;
  options: string[];
  onChange?: (options: string[]) => void;
}

export function useSelectPopover<T extends HTMLElement = HTMLElement>({
  propId,
  options,
  onChange,
}: UseSelectPopoverProps) {
  const ref = useRef<T>(null);
  const { openMenu } = useMenu();

  const [width, setWidth] = useState(0);

  const openSelectMenu = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect();

    openMenu(
      <MenuProvider>
        <SelectMenu propId={propId} options={options} onUpdate={onChange} />
      </MenuProvider>,
      {
        x: rect?.x,
        y: rect?.y,
        className:
          "max-h-[773px] min-h-[34px] w-[300px] overflow-visible backdrop-filter-none",
      },
    );
  }, [onChange, openMenu, options, propId]);

  useLayoutEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setWidth(rect.width);
  }, []);

  return { ref, width, openSelectMenu };
}
