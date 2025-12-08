import type { Row } from "@tanstack/react-table";

import type { Row as RowModel } from "../lib/types";

interface BoardGroupProps {
  row: Row<RowModel>;
}

export function BoardGroup({ row }: BoardGroupProps) {
  const groupId = row.groupingColumnId;
  if (!groupId) {
    console.error(`No grouping column id found for the grouped row ${row.id}`);
    return null;
  }

  return (
    <div className="flex cursor-grab">
      <div className="mr-3 box-content flex w-[260px] shrink-0 items-center rounded-lg px-2 text-sm">
        <span className="overflow-hidden pr-1.5 font-medium">
          <div className="inline-flex h-5 max-w-full min-w-0 shrink items-center rounded-lg bg-(--ca-graBacTerTra) px-2 text-sm/[1.2] text-(--c-graTexPri)">
            <div className="inline-flex h-5 items-center truncate leading-5">
              <div className="flex items-center">
                {row.renderGroupingValue({})}
              </div>
            </div>
          </div>
        </span>
      </div>
    </div>
  );
}
