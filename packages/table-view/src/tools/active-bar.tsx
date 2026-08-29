import { countFilterRules } from "@notion-kit/table-hook";
import {
  Button,
  PopoverTrigger,
  type PopoverHandle,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { FilterSelector } from "./filter-selector";
import { SortSelector } from "./sort-selector";

interface ActiveBarProps {
  filterHandle: PopoverHandle;
}

export function ActiveBar({ filterHandle }: ActiveBarProps) {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        sorting: state.sorting,
        filters: state.tableGlobal.filters,
      })}
    >
      {({ sorting, filters }) => {
        const sortingCount = sorting.length;
        const filterCount = countFilterRules(filters);
        if (sortingCount === 0 && filterCount === 0) return null;

        return (
          <div className="flex pt-1" data-testid="table-view-active-bar">
            <div className="relative grow-0 overflow-hidden">
              <div className="z-10 flex h-10 items-center gap-1 overflow-x-hidden overflow-y-auto py-2">
                {filterCount > 0 && (
                  <FilterSelector filterHandle={filterHandle} />
                )}
                {sortingCount > 0 && <SortSelector />}
                <PopoverTrigger
                  handle={filterHandle}
                  render={
                    <Button variant="hint" size="xs">
                      + Filter
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        );
      }}
    </table.Subscribe>
  );
}
