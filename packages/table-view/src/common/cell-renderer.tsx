import { useState, type ReactElement, type ReactNode } from "react";

import { cn } from "@notion-kit/cn";
import { useRect } from "@notion-kit/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/ui/primitives";

import { CellTrigger } from "./cell-trigger";
import { CopyButton } from "./copy-button";

export interface CellPopoverOptions {
  className?: string;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number | ((triggerRect: { height: number }) => number);
}

interface CellEditorPopoverProps {
  children: ReactElement;
  options?: CellPopoverOptions;
  renderEditor: (close: () => void) => ReactNode;
}

export function CellEditorPopover({
  children,
  options,
  renderEditor,
}: CellEditorPopoverProps) {
  const [open, setOpen] = useState(false);
  const { ref, rect } = useRect<HTMLElement>();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger ref={ref} nativeButton={false} render={children} />
      <PopoverContent
        align={options?.align}
        alignOffset={options?.alignOffset}
        side={options?.side}
        sideOffset={
          typeof options?.sideOffset === "function"
            ? options.sideOffset(rect)
            : options?.sideOffset
        }
        className={options?.className}
      >
        {renderEditor(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

interface CellRendererProps {
  compactClassName?: string;
  copyClassName?: string;
  copyButtonClassName?: string;
  copyValue?: string;
  disabled?: boolean;
  emptyContent?: ReactNode;
  hideWhenEmpty?: boolean;
  isEmpty: boolean;
  onClick?: () => void;
  popover?: CellPopoverOptions;
  renderEditor?: (close: () => void) => ReactNode;
  surface: "table" | "list" | "board" | "row-view" | "timeline";
  triggerClassName: string;
  value: ReactNode;
}

export function CellRenderer({
  compactClassName,
  copyClassName,
  copyButtonClassName,
  copyValue,
  disabled,
  emptyContent,
  hideWhenEmpty,
  isEmpty,
  onClick,
  popover,
  renderEditor,
  surface,
  triggerClassName,
  value,
}: CellRendererProps) {
  if (hideWhenEmpty && isEmpty) return null;

  const trigger = (
    <CellTrigger
      className={cn(
        triggerClassName,
        copyClassName,
        surface === "list" && "w-full",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {copyValue !== undefined && (
        <CopyButton className={copyButtonClassName} value={copyValue} />
      )}
      {emptyContent ?? value}
    </CellTrigger>
  );
  const content = renderEditor ? (
    <CellEditorPopover options={popover} renderEditor={renderEditor}>
      {trigger}
    </CellEditorPopover>
  ) : (
    trigger
  );

  if (surface !== "list" && surface !== "board") return content;
  return (
    <div
      className={cn(
        "flex empty:hidden",
        surface === "board" && "w-fit",
        compactClassName,
      )}
    >
      {content}
    </div>
  );
}
