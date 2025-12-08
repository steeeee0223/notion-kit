import React from "react";
import { flexRender, type Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

import type { Row as RowModel } from "../lib/types";

interface BoardCardProps {
  row: Row<RowModel>;
}

/**
 * A BoardCard is displayed as a table row
 */
export function BoardCard({ row }: BoardCardProps) {
  return (
    <div data-block-id={row.id}>
      <a
        rel="noopener noreferrer"
        href={`#${row.id}`}
        className="static mb-2 block h-full min-h-10 animate-bg-in cursor-pointer overflow-hidden rounded-lg bg-(--c-bacEle) text-inherit no-underline select-none"
      >
        {/* Card actions */}
        <div className="relative z-10">
          <div className="cursor-default" />
          <div
            className={cn(
              "pointer-events-auto absolute end-2 top-2 z-20 flex min-h-6 min-w-[calc(100%-16px)] overflow-hidden rounded-sm border border-border text-xs whitespace-nowrap text-secondary opacity-0 shadow-sm transition-opacity",
              "opacity-100",
            )}
          >
            <TooltipPreset description="Edit" side="top">
              <Button
                variant={null}
                className="flex rounded-none px-1.5 py-1 text-secondary"
                aria-label="Edit"
              >
                <Icon.PencilLine className="fill-current" />
              </Button>
            </TooltipPreset>
            <TooltipPreset
              description="Rename, delete, move to and more..."
              side="top"
            >
              <Button
                variant={null}
                className="flex rounded-none px-1.5 py-1 text-secondary"
                aria-label="Actions"
              >
                <Icon.Dots className="fill-current" />
              </Button>
            </TooltipPreset>
          </div>
        </div>
        {/* Card title */}
        <div className="relative flex w-auto items-center px-2.5 pt-2 pb-1.5">
          New Page
        </div>
        {/* Card properties */}
        <div className="flex flex-col pb-2 leading-normal">
          {row.getVisibleCells().map((cell) => (
            <React.Fragment key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </React.Fragment>
          ))}
        </div>
      </a>
    </div>
  );
}
