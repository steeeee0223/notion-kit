import type { HeaderContext } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Sortable,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { DefaultIcon } from "../common";
import type { Row } from "../lib/types";
import { PropMenu } from "../menus";

/**
 * Table Header Cell
 */
export function TableHeaderCell({
  header,
  table,
}: HeaderContext<Row, unknown>) {
  const info = header.column.getInfo();
  const isResizing = header.column.getIsResizing();
  const onResizeStart = header.getResizeHandler();
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
              <Sortable.Handle
                aria-label={info.name}
                id="notion-table-view-header-cell"
                variant="cell"
                className={cn(
                  "h-full overflow-hidden px-2 text-sm",
                  isResizing && "bg-transparent",
                )}
                style={{ width: header.column.getSize() }}
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
              </Sortable.Handle>
            }
          />
        </TooltipPreset>
        <DropdownMenuContent align="start" sideOffset={0} className="w-55">
          <PropMenu view="table" propId={header.column.id} />
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Resize handle */}
      <div className="absolute right-0 z-10 w-0 grow-0">
        <div
          role="presentation"
          tabIndex={-1}
          className={cn(
            "-mt-px ml-[-3px] h-[34px] w-[5px] animate-bg-out cursor-col-resize bg-transparent hover:bg-blue/80",
            isResizing && "bg-blue/80",
          )}
          // Resize for desktop
          onMouseDown={onResizeStart}
          onMouseUp={header.column.handleResizeEnd}
          // Resize for mobile
          onTouchStart={onResizeStart}
          onTouchEnd={header.column.handleResizeEnd}
        />
      </div>
    </Sortable.Item>
  );
}
