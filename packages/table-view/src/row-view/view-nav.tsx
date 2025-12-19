"use client";

import { useHotkeys } from "react-hotkeys-hook";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  Separator,
  TooltipPreset,
} from "@notion-kit/shadcn";
import { KEYBOARD } from "@notion-kit/utils";

import { RowViewIcon } from "../common";
import { ROW_VIEW_OPTIONS, RowViewType } from "../features";
import { useTableViewCtx } from "../table-contexts";

interface ViewNavProps {
  rowId: string;
}

export function ViewNav({ rowId }: ViewNavProps) {
  const { table } = useTableViewCtx();
  const { rowView } = table.getTableGlobalState();

  /** Keyboard shortcut */
  useHotkeys("esc", () => table.openRow(null), { preventDefault: true });
  useHotkeys(
    "meta+enter",
    () => table.openRowInFullPage(rowId),
    { preventDefault: true },
    [rowId],
  );

  return (
    <div className="flex h-11 items-center justify-between px-3">
      <div className="grid grid-flow-col items-center gap-0.5">
        {rowView !== "center" && (
          <TooltipPreset
            className="z-999"
            description={[
              { type: "default", text: "Close" },
              { type: "secondary", text: "Escape" },
            ]}
          >
            <Button
              variant="hint"
              className="size-6"
              onClick={() => table.openRow(null)}
            >
              <Icon.ArrowChevronDoubleBackward className="size-5 rotate-180 fill-icon" />
            </Button>
          </TooltipPreset>
        )}
        {rowView !== "full" && (
          <TooltipPreset
            className="z-999"
            description={[
              { type: "default", text: "Open in full page" },
              { type: "secondary", text: KEYBOARD.CMD + KEYBOARD.ENTER },
            ]}
          >
            <Button
              variant="hint"
              className="size-6"
              onClick={() => table.openRowInFullPage(rowId)}
            >
              <Icon.ArrowExpandDiagonalSmall className="size-5 fill-icon" />
            </Button>
          </TooltipPreset>
        )}
        <Separator
          orientation="vertical"
          className="mx-1 data-[orientation=vertical]:h-4"
        />
        <DropdownMenu>
          <TooltipPreset className="z-999" description="Switch peek mode">
            <DropdownMenuTrigger asChild>
              <Button variant="hint" className="size-6">
                <RowViewIcon rowView={rowView} className="fill-icon" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipPreset>
          <DropdownMenuContent className="z-999 w-52">
            <DropdownMenuGroup>
              {Object.entries(ROW_VIEW_OPTIONS).map(([key, option]) => {
                const view = key as RowViewType;
                return (
                  <DropdownMenuCheckboxItem
                    key={view}
                    Icon={<RowViewIcon rowView={view} />}
                    Body={option.label}
                    checked={rowView === view}
                    onCheckedChange={() =>
                      table.setTableGlobalState((v) => ({
                        ...v,
                        rowView: view,
                      }))
                    }
                  />
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="z-10 flex shrink-0 grow-0 items-center justify-end pl-3">
        <Button variant="hint" className="size-6">
          <Icon.Dots className="fill-icon" />
        </Button>
      </div>
    </div>
  );
}
