import {
  DropdownMenu,
  DropdownMenuContent,
  Popover,
  PopoverContent,
} from "@notion-kit/ui/primitives";

import { FilterMenu, SortMenu } from "@/menus";
import { useMenuCoordinator } from "@/table-contexts";

import { ActiveBar } from "./active-bar";
import { Toolbar } from "./toolbar";

export function ViewControls() {
  const { filterMenu, sortMenu } = useMenuCoordinator();

  return (
    <>
      <Toolbar />
      <ActiveBar />
      <Popover handle={filterMenu.handle}>
        <PopoverContent
          aria-label="Filters"
          align="start"
          side="bottom"
          collisionPadding={12}
          className="max-h-[min(70vh,720px)] w-[750px] overflow-auto"
        >
          <FilterMenu />
        </PopoverContent>
      </Popover>
      <DropdownMenu handle={sortMenu.handle}>
        <DropdownMenuContent
          align="start"
          side="bottom"
          collisionPadding={12}
          className="w-80"
        >
          <SortMenu />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
