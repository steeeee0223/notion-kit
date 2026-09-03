import { useId, useState, type ReactNode } from "react";

import { cn } from "@notion-kit/cn";
import { useInputField } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { ROW_VIEW_OPTIONS, wrappedClassName } from "@notion-kit/table-hook";
import type { Row } from "@notion-kit/table-hook";
import type { TitleConfig } from "@notion-kit/table-hook/plugins";
import { IconBlock, type IconData } from "@notion-kit/ui/icon-block";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { CellTrigger } from "@/common/cell-trigger";
import { RowViewIcon } from "@/common/default-icon";
import { TextInputPopover } from "@/common/text-input-popover";
import type { CellRendererProps } from "@/plugins/renderers";
import { useTableViewCtx } from "@/table-contexts";

export interface TitleCellSlotProps {
  value: ReactNode;
  props: CellRendererProps<string, TitleConfig>;
  row: Row;
  icon?: IconData;
}

export function TitleTableSlot({
  value,
  props,
  row,
  icon,
}: TitleCellSlotProps) {
  const { data, disabled, onChange, wrapped } = props;
  const { table } = useTableViewCtx();
  const { rowView } = table.getTableGlobalState();

  return (
    <TextInputPopover
      value={data}
      onUpdate={onChange}
      renderTrigger={({ width }) => (
        <CellTrigger disabled={disabled}>
          <div className="pointer-events-none absolute inset-x-0 top-1.5 z-20 mx-1 my-0 hidden justify-end group-hover/row:flex">
            <div
              id="quick-action-container"
              className="pointer-events-auto sticky right-1 flex bg-transparent"
            >
              <TooltipPreset
                description={ROW_VIEW_OPTIONS[rowView].tooltip}
                side="top"
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
              {value}
            </span>
          </div>
        </CellTrigger>
      )}
    />
  );
}

export function TitleCompactSlot({
  value,
  props: cellProps,
  icon,
}: TitleCellSlotProps) {
  const { data, disabled, onChange } = cellProps;
  const [open, setOpen] = useState(false);
  const id = useId();
  const { props: inputProps, reset } = useInputField({
    id: `title-list-cell-${id}`,
    initialValue: data,
    onUpdate: (v) => {
      onChange(v);
      setOpen(false);
    },
  });

  return (
    <CellTrigger
      className="w-full cursor-default hover:bg-transparent"
      disabled={disabled}
    >
      <div className="pointer-events-none top-1.5 z-20 order-3 mx-1 my-0 hidden justify-end group-hover/row:flex has-aria-expanded:flex">
        <div
          id="quick-action-container"
          className="pointer-events-auto relative flex bg-transparent p-0.5"
        >
          <Popover open={open} onOpenChange={setOpen}>
            <TooltipPreset description="Edit" side="top">
              <PopoverTrigger
                render={
                  <Button
                    tabIndex={0}
                    aria-label="Edit"
                    size="xs"
                    className="rounded-md bg-main text-secondary shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon.PencilLine className="fill-current" />
                  </Button>
                }
              />
            </TooltipPreset>
            <PopoverContent
              side="bottom"
              className="max-h-[773px] min-h-[38px] w-60 overflow-visible backdrop-filter-none"
            >
              <Input
                spellCheck
                className="max-h-[771px] min-h-9 border-none bg-transparent wrap-break-word whitespace-pre-wrap caret-primary"
                variant="flat"
                {...inputProps}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    reset();
                    setOpen(false);
                    return;
                  }
                  inputProps.onKeyDown?.(event);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="contents h-5 items-center">
        {icon && <IconBlock icon={icon} className="contents" />}
        <span className="mr-[5px] ml-1 inline leading-normal font-medium">
          {data ? value : <span className="text-muted">New page</span>}
        </span>
      </div>
    </CellTrigger>
  );
}
