import { useState, type ReactNode } from "react";
import { functionalUpdate, type OnChangeFn } from "@tanstack/react-table";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

interface BulkEditorPopoverProps<Data> {
  children: (data: Data, onChange: OnChangeFn<Data>) => ReactNode;
  disabled?: boolean;
  icon: ReactNode;
  initialData: Data;
  label: string;
  onChange: OnChangeFn<Data>;
}

export function BulkEditorPopover<Data>({
  children,
  disabled,
  icon,
  initialData,
  label,
  onChange,
}: BulkEditorPopoverProps<Data>) {
  const [data, setData] = useState(initialData);
  const update: OnChangeFn<Data> = (updater) => {
    const next = functionalUpdate(updater, data);
    setData(next);
    onChange(next);
  };

  return (
    <Popover>
      <TooltipPreset description={label} side="top">
        <PopoverTrigger
          render={
            <Button
              variant="cell"
              aria-label={label}
              disabled={disabled}
              className="h-full shrink-0 rounded-none border-r px-2"
            >
              {icon}
            </Button>
          }
        />
      </TooltipPreset>
      <PopoverContent align="start" side="bottom" className="w-62">
        {children(data, update)}
      </PopoverContent>
    </Popover>
  );
}

interface BulkEditorToggleProps {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export function BulkEditorToggle({
  disabled,
  icon,
  label,
  onClick,
}: BulkEditorToggleProps) {
  return (
    <TooltipPreset description={label} side="top">
      <Button
        variant="cell"
        aria-label={label}
        disabled={disabled}
        className="h-full shrink-0 rounded-none border-r px-2"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        {icon}
      </Button>
    </TooltipPreset>
  );
}
