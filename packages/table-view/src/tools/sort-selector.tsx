import { useStore } from "@tanstack/react-store";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { SortMenu } from "../menus";

export function SortSelector() {
  const { table } = useTableViewCtx();

  const sorting = useStore(table.atoms.sorting, (state) => state);
  const columnsInfo = useStore(table.atoms.columnsInfo, (state) => state);

  const badgeDisplay = (() => {
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
          {columnsInfo[sort.id]?.name}
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="soft-blue"
            size="xs"
            className="gap-1 rounded-full px-2 text-sm [&_svg]:fill-current"
          >
            {badgeDisplay}
            <Icon.Chevron side="down" className="size-3" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-80">
        <SortMenu />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
