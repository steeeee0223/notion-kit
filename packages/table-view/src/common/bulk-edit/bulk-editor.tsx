import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import type { OnChangeFn } from "@tanstack/react-table";

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
  // An internal draft state
  const [data, setData] = useState(initialData);
  const [revision, setRevision] = useState(0);
  const notifyChange = useEffectEvent(onChange);
  useEffect(() => {
    if (revision > 0) notifyChange(data);
  }, [data, revision]);

  const update: OnChangeFn<Data> = (updater) => {
    setData(updater);
    setRevision((previous) => previous + 1);
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
