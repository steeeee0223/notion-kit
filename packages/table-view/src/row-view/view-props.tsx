"use client";

import { IconBlock } from "@notion-kit/icon-block";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { DefaultIcon, TableCell } from "../common";
import { PropMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";

interface ViewPropsProps {
  rowId: string;
}

export function ViewProps({ rowId }: ViewPropsProps) {
  const { table } = useTableViewCtx();
  const row = table.getRow(rowId);

  return (
    <div className="flex flex-col gap-2 pt-2">
      <div role="table">
        {row.getVisibleCells().map((cell) => {
          const colId = cell.column.id;
          const info = cell.column.getInfo();

          // Skip title property
          if (info.type === "title") return null;
          return (
            <div
              key={colId}
              role="row"
              className="relative mb-1 flex w-full gap-1"
            >
              <div
                role="cell"
                id={colId}
                className="flex h-[34px] w-40 max-w-40 min-w-0 shrink-0 items-center text-secondary"
              >
                <DropdownMenu>
                  <TooltipPreset
                    side="left"
                    className="z-990"
                    description={
                      info.description
                        ? [
                            { type: "default", text: info.name },
                            { type: "secondary", text: info.description },
                          ]
                        : info.name
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="cell"
                        className="h-full w-full max-w-full rounded-sm px-1.5"
                      >
                        {info.icon ? (
                          <IconBlock
                            icon={info.icon}
                            className="size-4 p-0 opacity-60 dark:opacity-45"
                          />
                        ) : (
                          <DefaultIcon
                            type={info.type}
                            className="fill-default/45"
                          />
                        )}
                        <div className="truncate">{info.name}</div>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipPreset>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={0}
                    className="z-990 w-60"
                  >
                    <PropMenu view="row" propId={colId} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div
                role="cell"
                data-block-id={rowId}
                className="flex h-full min-w-0 flex-[1_1_auto] flex-wrap"
              >
                <TableCell
                  view="row-view"
                  row={row}
                  column={cell.column}
                  table={table}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
