import { Icon } from "@notion-kit/icons";
import {
  CountMethod,
  resolveCountingMethod,
  type HeaderInstance,
} from "@notion-kit/table-hook";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

import { CalcMenu } from "@/menus";
import type { CellPlugin, InferKey } from "@/plugins";
import { useTableViewCtx } from "@/table-contexts";

interface TableFooterCellProps {
  column: HeaderInstance["column"];
}

export function TableFooterCell({ column }: TableFooterCellProps) {
  const info = column.getInfo();
  const props = {
    id: column.id,
    type: info.type,
    width: column.getWidth(),
  };

  return (
    <div className="flex" style={{ width: props.width }}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`${info.name} calculation`}
              tabIndex={0}
              variant="cell"
              className="h-8 w-full justify-end overflow-hidden pr-2 select-auto"
            >
              <CountDisplay {...props} />
            </Button>
          }
        />

        <DropdownMenuContent className="w-50" align="start" alignOffset={-4}>
          <CalcMenu id={column.id} />
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
  return (
    <table.Subscribe selector={(state) => state.columnCounting[id]}>
      {(counting) => {
        const method = counting?.method ?? CountMethod.NONE;
        const countingMethod = resolveCountingMethod(
          table.getColumnPlugin(id),
          method,
        );
        const label = countingMethod?.label ?? countingMethod?.name;

        return method === (CountMethod.NONE as string) || !countingMethod ? (
          <div className="flex items-center opacity-100 transition-opacity duration-200">
            <div className="flex items-center">
              <span className="text-muted">
                {type === "checkbox" ? "∑" : "Calculate"}
              </span>
              <Icon.Chevron
                side="down"
                className="mt-px ml-1 block size-2.5 shrink-0 fill-muted"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            {label && (
              <span className="mt-0.5 text-[10px] tracking-[1px] text-muted uppercase select-none">
                {label}
              </span>
            )}
            <span className="flex h-full items-center">
              {table.getColumnCountResult(id)}
            </span>
          </div>
        );
      }}
    </table.Subscribe>
  );
}
