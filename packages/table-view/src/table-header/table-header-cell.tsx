import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import type { HeaderInstance, TableInstance } from "@notion-kit/table-hook";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Sortable,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { DefaultIcon } from "@/common";

import { PropMenu } from "../menus";

type TableGlobalReader = Pick<TableInstance, "getTableGlobalState">;

interface TableHeaderCellProps {
  header: HeaderInstance;
  table: TableGlobalReader;
}

/**
 * Table Header Cell
 */
export function TableHeaderCell({ header, table }: TableHeaderCellProps) {
  const info = header.column.getInfo();
  const isResizing = header.column.getIsResizing();
  const onResizeStart = header.getResizeHandler();
  const onResizeEnd = () => header.column.handleResizeEnd();
  const { locked } = table.getTableGlobalState();

  const style: React.CSSProperties = {
    width: header.column.getWidth(),
  };

  return (
    <Sortable.Item
      id={header.column.id}
      index={header.column.getIndex()}
      disabled={locked}
      style={style}
      render={
        <div className="relative flex cursor-grab flex-row whitespace-nowrap" />
      }
    >
      <DropdownMenu modal={false}>
        <TooltipPreset
          description={
            info.description ? (
              <>
                <TooltipDescription text={info.name} />
                <TooltipDescription type="secondary" text={info.description} />
              </>
            ) : (
              info.name
            )
          }
          side="top"
        >
          <DropdownMenuTrigger
            disabled={locked}
            render={
              <Button
                type="button"
                variant="cell"
                aria-label={info.name}
                id="notion-table-view-header-cell"
                className={cn(
                  "flex h-full min-w-0 flex-1 items-center gap-1 overflow-hidden px-2 text-sm",
                  isResizing && "bg-transparent",
                )}
              >
                {info.icon ? (
                  <IconBlock
                    icon={info.icon}
                    className="size-4 p-0 opacity-60 dark:opacity-45"
                  />
                ) : (
                  <DefaultIcon type={info.type} className="fill-default/45" />
                )}
                <div className="truncate">{info.name}</div>
                {info.description && <Icon.Info className="size-3 fill-icon" />}
              </Button>
            }
          />
        </TooltipPreset>
        <DropdownMenuContent align="start" sideOffset={0} className="w-55">
          <PropMenu view="table" propId={header.column.id} />
        </DropdownMenuContent>
      </DropdownMenu>
      <Sortable.Handle
        aria-label={`Move ${info.name}`}
        className="h-full w-4 shrink-0 px-0"
      />
      {/* Resize handle */}
      <div className="absolute right-0 z-10 w-0 grow-0">
        <div
          role="separator"
          aria-label={`Resize ${info.name}`}
          aria-orientation="vertical"
          tabIndex={-1}
          className={cn(
            "-mt-px ml-[-3px] h-[34px] w-[5px] animate-bg-out cursor-col-resize bg-transparent hover:bg-blue/80",
            isResizing && "bg-blue/80",
          )}
          // Resize for desktop
          onMouseDown={onResizeStart}
          onMouseUp={onResizeEnd}
          // Resize for mobile
          onTouchStart={onResizeStart}
          onTouchEnd={onResizeEnd}
        />
      </div>
    </Sortable.Item>
  );
}
