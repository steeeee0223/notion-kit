"use client";

import { useMemo, useRef } from "react";

import { Icon } from "@notion-kit/icons";
import { Button, MenuProvider, useMenu } from "@notion-kit/shadcn";

import { SortMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";

export function SortSelector() {
  const { openMenu } = useMenu();
  const { table } = useTableViewCtx();

  const ref = useRef<HTMLButtonElement>(null);
  const openSortMenu = () => {
    const { top, left } = ref.current?.getBoundingClientRect() ?? {
      top: 0,
      left: 0,
    };
    openMenu(
      <MenuProvider>
        <SortMenu />
      </MenuProvider>,
      { x: left, y: top + 32, className: "w-80" },
    );
  };

  const sorting = table.getState().sorting;
  const badgeDisplay = useMemo(() => {
    const count = sorting.length;
    if (count === 1) {
      const sort = sorting[0]!;
      return (
        <>
          {sort.desc ? (
            <Icon.ArrowDown className="size-3.5" />
          ) : (
            <Icon.ArrowUp className="size-3.5" />
          )}
          {table.getColumnInfo(sort.id).name}
        </>
      );
    }
    return (
      <>
        <Icon.ArrowUpDown className="size-4" />
        {count} sorts
      </>
    );
  }, [sorting, table]);

  return (
    <Button
      ref={ref}
      variant="soft-blue"
      size="xs"
      className="gap-1 rounded-full px-2 text-sm [&_svg]:fill-current"
      onClick={openSortMenu}
    >
      {badgeDisplay}
      <Icon.ChevronDown className="size-3" />
    </Button>
  );
}
