import { useMemo } from "react";

import { Popover, PopoverContent } from "@notion-kit/ui/primitives";

import { FilterMenu } from "@/menus";

import { ActiveBar } from "./active-bar";
import { Toolbar } from "./toolbar";

export function ViewControls() {
  const filterHandle = useMemo(() => Popover.createHandle(), []);

  return (
    <>
      <Toolbar filterHandle={filterHandle} />
      <ActiveBar filterHandle={filterHandle} />
      <Popover handle={filterHandle}>
        {() => (
          <PopoverContent
            aria-label="Filters"
            align="start"
            side="bottom"
            collisionPadding={12}
            className="max-h-[min(70vh,720px)] w-[750px] overflow-auto"
          >
            <FilterMenu />
          </PopoverContent>
        )}
      </Popover>
    </>
  );
}
