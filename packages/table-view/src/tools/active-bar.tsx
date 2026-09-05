import { countFilterRules } from "@notion-kit/table-hook";

import { useTableViewCtx } from "@/table-contexts";

import { FilterSelector } from "./filter-selector";
import { SortSelector } from "./sort-selector";

export function ActiveBar() {
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
          <div
            className="sticky inset-s-0 flex pt-1"
            data-testid="table-view-active-bar"
          >
            <div className="relative grow-0 overflow-hidden">
              <div className="z-10 flex h-10 items-center gap-1 overflow-x-hidden overflow-y-auto py-2">
                {filterCount > 0 && <FilterSelector />}
                {sortingCount > 0 && <SortSelector />}
              </div>
            </div>
          </div>
        );
      }}
    </table.Subscribe>
  );
}
