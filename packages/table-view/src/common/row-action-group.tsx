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

import { RowActionMenu } from "../menus";

interface RowActionGroupProps extends React.ComponentProps<"div"> {
  hasSelection: boolean;
  isMobile?: boolean;
  row: RowInstance;
  onAddNext: (e: React.MouseEvent) => void;
}

export function RowActionGroup({
  className,
  hasSelection,
  isMobile,
  row,
  onAddNext,
  ...props
}: RowActionGroupProps) {
  return (
    <div className={cn("bg-main", className)} {...props}>
      <div
        data-slot="row-action-group"
        className={cn(
          "flex h-full items-center gap-1 opacity-0 transition-opacity delay-0 duration-200",
          "group-hover/row:opacity-100",
          "group-data-dragging/row:opacity-100",
          "has-[button[aria-expanded='true']]:opacity-100",
          (hasSelection || isMobile) && "opacity-100",
        )}
      >
        <TooltipPreset
          description={
            <>
              <TooltipDescription text="Click to add below" />
              <TooltipDescription
                type="secondary"
                text="Option-click to add above"
              />
            </>
          }
          className="text-center"
        >
          <Button
            variant="hint"
            aria-label="Add row"
            className="size-6"
            onClick={onAddNext}
          >
            <Icon.Plus className="size-3.5 fill-icon" />
          </Button>
        </TooltipPreset>
        <Popover>
          <TooltipPreset
            description={
              <>
                <TooltipDescription text="Drag to move" />
                <TooltipDescription text="Click to open menu" />
              </>
            }
            className="text-center"
          >
            <PopoverTrigger
              render={
                <Sortable.Handle
                  aria-label="Row actions"
                  className="h-6 w-4.5"
                />
              }
            />
          </TooltipPreset>
          <PopoverContent className="w-[265px]" side="right" align="start">
            <RowActionMenu rowId={row.id} />
          </PopoverContent>
        </Popover>
        <Checkbox
          id={`row-select-${row.id}`}
          size="sm"
          checked={row.getIsSelected()}
          className="cursor-pointer rounded-xs accent-blue"
          aria-label={`Select row ${row.id}`}
          onClick={(event) => {
            row.getToggleSelectedHandler()({
              target: { checked: !row.getIsSelected() },
              shiftKey: event.shiftKey,
              nativeEvent: event,
            });
          }}
        />
      </div>
    </div>
  );
}
