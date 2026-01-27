"use client";

import { useMemo, useState } from "react";

import { Button } from "@notion-kit/shadcn";

import { contentColumns, getHighlightColumns } from "./columns";
import { contentTables, highlightData } from "./data";
import { DataTable } from "./data-table";

interface PlansTableProps {
  canUpgrade?: boolean;
}

export function PlansTable({ canUpgrade }: PlansTableProps) {
  const [toggle, setToggle] = useState(true);
  const highlightTable = useMemo(() => {
    const column = getHighlightColumns(canUpgrade);
    return <DataTable type="highlight" columns={column} data={highlightData} />;
  }, [canUpgrade]);

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="sticky top-[-36px] z-10 w-full">{highlightTable}</div>
      {!toggle && (
        <div className="flex w-full flex-col gap-7 py-[22px] opacity-100">
          {contentTables.map(({ title, data }) => (
            <div key={title} className="flex w-full flex-col gap-3">
              <div className="px-3 text-xs font-semibold text-secondary">
                {title}
              </div>
              <DataTable type="content" columns={contentColumns} data={data} />
            </div>
          ))}
        </div>
      )}
      <Button
        variant="hint"
        size="sm"
        className="h-7 font-semibold text-primary"
        onClick={() => setToggle((prev) => !prev)}
      >
        {toggle ? "Compare all features" : "Collapse"}
      </Button>
    </div>
  );
}
