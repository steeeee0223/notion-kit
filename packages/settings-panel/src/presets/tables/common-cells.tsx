import { SortDirection } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

interface TextCellProps {
  header?: boolean;
  value: string;
  className?: string;
}

export function TextCell({ header, value, className }: TextCellProps) {
  return (
    <div
      className={cn(
        "truncate text-xs font-normal text-secondary",
        header && "text-sm",
        className,
      )}
    >
      {value}
    </div>
  );
}

interface SortingToggleProps {
  title: string;
  isSorted: false | SortDirection;
  toggle: () => void;
}

export function SortingToggle({ title, isSorted, toggle }: SortingToggleProps) {
  return (
    <Button variant="hint" size="xs" onClick={toggle} className="gap-0.5 px-1">
      <TextCell header value={title} />
      {isSorted &&
        (isSorted === "asc" ? (
          <Icon.ArrowUp className="ml-1 size-3 flex-shrink-0 fill-secondary" />
        ) : (
          <Icon.ArrowDown className="ml-1 size-3 flex-shrink-0 fill-secondary" />
        ))}
    </Button>
  );
}
