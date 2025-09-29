"use client";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@notion-kit/shadcn";

import { CountMethod } from "../features";
import { CalcMenu, countMethodHint } from "../menus";
import type { CellPlugin, InferKey } from "../plugins";
import { useTableViewCtx } from "../table-contexts";

interface TableFooterCellProps {
  id: string; // column id
  type: InferKey<CellPlugin>;
  width?: string;
}

export function TableFooterCell({ width, ...props }: TableFooterCellProps) {
  return (
    <div className="flex" style={{ width }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            tabIndex={0}
            variant="cell"
            className="h-8 w-full justify-end overflow-hidden pr-2 select-auto"
          >
            <CountDisplay {...props} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50" align="start" alignOffset={-4}>
          <CalcMenu {...props} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface CountDisplayProps {
  id: string;
  type: InferKey<CellPlugin>;
}

function CountDisplay({ id, type }: CountDisplayProps) {
  const { table, getColumnCount } = useTableViewCtx();
  const counting = table.getColumnCounting(id);

  return counting.method === CountMethod.NONE ? (
    <div className="flex items-center opacity-100 transition-opacity duration-200">
      <div className="flex items-center">
        <span className="text-muted">
          {type === "checkbox" ? "∑" : "Calculate"}
        </span>
        <Icon.ChevronDown className="mt-px ml-1 block size-2.5 shrink-0 fill-muted" />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-1">
      <span className="mt-0.5 text-[10px] tracking-[1px] text-muted uppercase select-none">
        {countMethodHint[counting.method].label}
      </span>
      <span className="flex h-full items-center">
        {getColumnCount(id, type, counting.method)}
      </span>
    </div>
  );
}
