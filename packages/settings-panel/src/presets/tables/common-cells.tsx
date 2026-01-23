import { SortDirection } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import type { User } from "@notion-kit/schemas";
import { Button } from "@notion-kit/shadcn";

import { Avatar } from "../_components";

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
    <Button variant="hint" size="xs" onClick={toggle} className="px-1">
      <TextCell header value={title} />
      {isSorted &&
        (isSorted === "asc" ? (
          <Icon.ArrowUp className="size-3 shrink-0 fill-icon" />
        ) : (
          <Icon.ArrowDown className="size-3 shrink-0 fill-icon" />
        ))}
    </Button>
  );
}

interface UserCellProps {
  user: User;
}
export function UserCell({ user }: UserCellProps) {
  return (
    <div className="z-20 flex h-full min-h-[42px] w-[220px] items-center justify-between">
      <div className="flex w-full items-center gap-2.5">
        <Avatar src={user.avatarUrl} fallback={user.name} className="size-7" />
        <div className="max-w-[164px]">
          <div className="truncate text-sm text-primary">{user.name}</div>
          <div className="truncate text-xs text-secondary">{user.email}</div>
        </div>
      </div>
    </div>
  );
}
