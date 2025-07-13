"use client";

import { useRef } from "react";

import { Icon } from "@notion-kit/icons";
import { Button, useMenu } from "@notion-kit/shadcn";

import { SortMenu } from "../menus";

export function SortSelector() {
  const { openMenu } = useMenu();

  const ref = useRef<HTMLButtonElement>(null);
  const openSortMenu = () => {
    const { top, left } = ref.current?.getBoundingClientRect() ?? {
      top: 0,
      left: 0,
    };
    openMenu(<SortMenu />, { x: left, y: top + 32 });
  };

  return (
    <Button
      ref={ref}
      variant="soft-blue"
      size="xs"
      className="gap-1 rounded-full px-2 text-sm [&_svg]:fill-current"
      onClick={openSortMenu}
    >
      <Icon.ArrowUp className="size-3.5" />
      Name
      <Icon.ChevronDown className="size-3" />
    </Button>
  );
}
