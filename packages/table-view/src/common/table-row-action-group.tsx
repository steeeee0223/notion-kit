import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  ButtonProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { RowActionMenu } from "../menus";

interface TableRowActionGroupProps extends React.ComponentProps<"div"> {
  isDragging?: boolean;
  isMobile?: boolean;
}

export function TableRowActionGroup({
  className,
  isDragging,
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
          "has-[button[aria-expanded='true']]:opacity-100",
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          (isMobile || isDragging) && "opacity-100",
        )}
        {...props}
      />
    </div>
  );
}

interface RowActionsProps {
  className?: string;
  rowId: string;
  isDragging: boolean;
  isMobile: boolean;
  dragHandleProps: ButtonProps;
  onAddNext: (e: React.MouseEvent) => void;
}

export function RowActions({
  className,
  rowId,
  isDragging,
  isMobile,
  dragHandleProps,
  onAddNext,
}: RowActionsProps) {
  return (
    <TableRowActionGroup
      className={className}
      isDragging={isDragging}
      isMobile={isMobile}
    >
      <TooltipPreset
        description={[
          { type: "default", text: "Click to add below" },
          { type: "secondary", text: "Option-click to add above" },
        ]}
        className="z-999 text-center"
      >
        <Button variant="hint" className="size-6" onClick={onAddNext}>
          <Icon.Plus className="size-3.5 fill-icon" />
        </Button>
      </TooltipPreset>
      <Popover>
        <TooltipPreset
          description={[
            { type: "default", text: "Drag to move" },
            { type: "default", text: "Click to open menu" },
          ]}
          disabled={isDragging}
          className="z-999 text-center"
        >
          <PopoverTrigger asChild>
            <Button
              variant="hint"
              className="h-6 w-4.5"
              data-draggable-handle
              {...dragHandleProps}
            >
              <Icon.DragHandle className="size-3.5 fill-icon" />
            </Button>
          </PopoverTrigger>
        </TooltipPreset>
        <PopoverContent className="w-[265px]" side="right" align="start">
          <RowActionMenu rowId={rowId} />
        </PopoverContent>
      </Popover>
    </TableRowActionGroup>
  );
}
