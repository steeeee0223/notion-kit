"use client";

import { useId, useState } from "react";

import { cn } from "@notion-kit/cn";
import { useInputField } from "@notion-kit/hooks";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { CellTrigger, RowViewIcon, TextInputPopover } from "../../common";
import { ROW_VIEW_OPTIONS } from "../../features";
import { wrappedClassName } from "../../lib/utils";
import { useTableViewCtx } from "../../table-contexts";
import type { CellProps } from "../types";
import type { TitleConfig } from "./types";

interface TitleCellProps extends CellProps<string, TitleConfig> {
  icon?: IconData;
}

export function TitleCell({ layout, ...props }: TitleCellProps) {
  switch (layout) {
    case "table":
      return <TitleTableCell {...props} />;
    case "list":
      return <TitleListCell {...props} />;
    default:
      return null;
  }
}

function TitleTableCell({
  icon,
  data,
  row,
  wrapped,
  disabled,
  onChange,
}: Omit<TitleCellProps, "layout">) {
  const { table } = useTableViewCtx();
  const { rowView } = table.getTableGlobalState();

  return (
    <TextInputPopover
      value={data}
      onUpdate={onChange}
      renderTrigger={({ width }) => (
        <CellTrigger wrapped={wrapped} layout="table" aria-disabled={disabled}>
          <div className="pointer-events-none absolute top-1.5 right-0 left-0 z-20 mx-1 my-0 hidden justify-end group-hover/row:flex">
            <div
              id="quick-action-container"
              className="pointer-events-auto sticky right-1 flex bg-transparent"
            >
              <TooltipPreset
                description={ROW_VIEW_OPTIONS[rowView].tooltip}
                side="top"
                className="z-990"
              >
                <Button
                  tabIndex={0}
                  aria-label={ROW_VIEW_OPTIONS[rowView].tooltip}
                  size="xs"
                  className="rounded-md bg-main fill-secondary leading-tight font-medium tracking-[0.5px] text-secondary uppercase shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    table.openRow(row.id);
                  }}
                >
                  <RowViewIcon rowView={rowView} />
                  {width > 110 && <>Open</>}
                </Button>
              </TooltipPreset>
            </div>
          </div>
          <div className="contents h-5 items-center">
            {icon && <IconBlock icon={icon} className="contents" />}
            <span
              className={cn(
                "mr-[5px] ml-1 inline leading-normal font-medium underline decoration-muted underline-offset-2",
                wrappedClassName(wrapped),
              )}
            >
              {data}
            </span>
          </div>
        </CellTrigger>
      )}
    />
  );
}

function TitleListCell({
  icon,
  data,
  disabled,
  onChange,
}: Omit<TitleCellProps, "layout">) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { props } = useInputField({
    id: `title-list-cell-${id}`,
    initialValue: data,
    onUpdate: (v) => {
      onChange(v);
      setOpen(false);
    },
  });

  return (
    <CellTrigger
      className="min-w-30 flex-[1_1_auto] cursor-default hover:bg-transparent"
      layout="list"
      aria-disabled={disabled}
      stopPropagation={false}
    >
      <div className="pointer-events-none top-1.5 z-20 order-3 mx-1 my-0 hidden justify-end group-hover/row:flex has-aria-expanded:flex">
        <div
          id="quick-action-container"
          className="pointer-events-auto relative flex bg-transparent p-0.5"
        >
          <Popover open={open} onOpenChange={setOpen}>
            <TooltipPreset description="Edit" side="top" className="z-990">
              <PopoverTrigger asChild>
                <Button
                  tabIndex={0}
                  aria-label="Edit"
                  size="xs"
                  className="rounded-md bg-main text-secondary shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon.PencilLine className="fill-current" />
                </Button>
              </PopoverTrigger>
            </TooltipPreset>
            <PopoverContent
              side="bottom"
              className="z-990 max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none"
            >
              <Input
                spellCheck
                className="max-h-[771px] min-h-9 border-none bg-transparent word-break whitespace-pre-wrap caret-primary"
                variant="flat"
                {...props}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="contents h-5 items-center">
        {icon && <IconBlock icon={icon} className="contents" />}
        <span className="mr-[5px] ml-1 inline leading-normal font-medium">
          {data || <span className="text-muted">New page</span>}
        </span>
      </div>
    </CellTrigger>
  );
}
