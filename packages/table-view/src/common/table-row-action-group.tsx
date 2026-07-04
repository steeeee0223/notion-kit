import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sortable,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { RowActionMenu } from "../menus";

interface TableRowActionGroupProps extends React.ComponentProps<"div"> {
  isMobile?: boolean;
}

export function TableRowActionGroup({
  className,
  isMobile,
  ...props
}: TableRowActionGroupProps) {
  return (
    <div className={cn("bg-main", className)}>
      <div
        data-slot="table-row-action-group"
        className={cn(
          "flex h-full items-center opacity-0 transition-opacity delay-0 duration-200",
          "group-hover/row:opacity-100",
          "group-data-dragging/row:opacity-100",
          "has-[button[aria-expanded='true']]:opacity-100",
          isMobile && "opacity-100",
        )}
        {...props}
      />
    </div>
  );
}

interface RowActionsProps {
  className?: string;
  rowId: string;
  isMobile: boolean;
  onAddNext: (e: React.MouseEvent) => void;
}

export function RowActions({
  className,
  rowId,
  isMobile,
  onAddNext,
}: RowActionsProps) {
  return (
    <TableRowActionGroup className={className} isMobile={isMobile}>
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
              <Sortable.Handle aria-label="Row actions" className="h-6 w-4.5" />
            }
          />
        </TooltipPreset>
        <PopoverContent className="w-[265px]" side="right" align="start">
          <RowActionMenu rowId={rowId} />
        </PopoverContent>
      </Popover>
    </TableRowActionGroup>
  );
}
