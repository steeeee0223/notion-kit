"use client";

import { Column } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@notion-kit/shadcn";

import { CountMethod } from "../features";
import { Row } from "../lib/types";
import { CalcMenu, countMethodHint } from "../menus";
import type { CellPlugin, InferKey } from "../plugins";
import { useTableViewCtx } from "../table-contexts";

interface TableFooterCellProps {
  column: Column<Row>;
}

export function TableFooterCell({ column }: TableFooterCellProps) {
  const props = {
    id: column.id,
    type: column.getInfo().type,
    width: column.getWidth(),
  };

  return (
    <div className="flex" style={{ width: props.width }}>
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
        <DropdownMenuContent
          className="z-990 w-50"
          align="start"
          alignOffset={-4}
        >
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
  const { table } = useTableViewCtx();
  const { method } = table.getColumnCounting(id);

  return method === CountMethod.NONE ? (
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
        {countMethodHint[method].label}
      </span>
      <span className="flex h-full items-center">
        {table.getColumnCountResult(id)}
      </span>
    </div>
  );
}
