import { useRef, useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import type { RowInstance } from "@notion-kit/table-hook";
import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sortable,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { RowActionMenu } from "@/menus";
import { useTableViewMessages } from "@/messages";

import { Row } from "./table";

interface RowActionGroupProps {
  className?: string;
  row: RowInstance;
}

export function RowActionGroup({ className, row }: RowActionGroupProps) {
  const messages = useTableViewMessages();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const addNextRow = (event: React.MouseEvent) => {
    row.table.addRow({
      id: row.id,
      at: event.altKey ? "prev" : "next",
    });
  };

  return (
    <Row.ActionContent
      data-slot="row-action-group"
      className={cn(
        "group-data-dragging/row:opacity-100",
        "has-[button[aria-expanded='true']]:opacity-100",
        className,
      )}
    >
      <TooltipPreset
        description={
          <>
            <TooltipDescription text={messages.rowActions.addRowBelow} />
            <TooltipDescription
              type="secondary"
              text={messages.rowActions.addRowAbove}
            />
          </>
        }
        className="text-center"
      >
        <Button
          variant="hint"
          aria-label={messages.rowActions.addRow}
          className="size-6"
          onClick={addNextRow}
        >
          <Icon.Plus className="size-3.5 fill-icon" />
        </Button>
      </TooltipPreset>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <TooltipPreset
          description={
            <>
              <TooltipDescription text={messages.rowActions.dragToMove} />
              <TooltipDescription text={messages.rowActions.clickToOpenMenu} />
            </>
          }
          className="text-center"
        >
          <PopoverTrigger
            ref={triggerRef}
            render={
              <Sortable.Handle
                aria-label={messages.rowActions.rowActions}
                className="h-6 w-4.5"
              />
            }
          />
        </TooltipPreset>
        <PopoverContent className="w-[265px]" side="right" align="start">
          <RowActionMenu
            rowId={row.id}
            onClose={() => setMenuOpen(false)}
            getReturnFocus={() => triggerRef.current}
          />
        </PopoverContent>
      </Popover>
      <Checkbox
        id={`row-select-${row.id}`}
        size="sm"
        checked={row.getIsSelected()}
        className="ml-1.5 cursor-pointer rounded-xs accent-blue"
        aria-label={messages.rowActions.selectRow(row.id)}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    </Row.ActionContent>
  );
}
