"use client";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

import { SortMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";

export function SortSelector() {
  const { table } = useTableViewCtx();

  const badgeDisplay = (() => {
    const sorting = table.getState().sorting;
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
  })();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="soft-blue"
          size="xs"
          className="gap-1 rounded-full px-2 text-sm [&_svg]:fill-current"
        >
          {badgeDisplay}
          <Icon.ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-990 w-80">
        <SortMenu />
      </PopoverContent>
    </Popover>
  );
}
