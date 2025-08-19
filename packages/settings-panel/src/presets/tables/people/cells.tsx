"use client";

import { SortDirection } from "@tanstack/react-table";
import { CircleArrowUp, MoreHorizontalIcon } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { useTransition } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Role } from "@notion-kit/schemas";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SelectPreset as Select,
  type SelectPresetProps,
} from "@notion-kit/shadcn";

import { Avatar } from "../../_components";
import { Scope } from "../../../lib";
import type { GuestRow, MemberRow, PartialRole } from "../../../lib";
import { roleLabels, roleOptions } from "./constants";

interface HeaderProps {
  title: string;
  className?: string;
}

/**
 * Extended version
 * @see my-connections
 */
export const Header = ({ title, className }: HeaderProps) => {
  return (
    <div
      className={cn("truncate text-xs font-normal text-secondary", className)}
    >
      {title}
    </div>
  );
};

interface SortingToggleProps {
  title: string;
  isSorted: false | SortDirection;
  toggle: () => void;
}

export const SortingToggle = ({
  title,
  isSorted,
  toggle,
}: SortingToggleProps) => (
  <Button variant="hint" size="xs" onClick={toggle} className="gap-0.5 px-1">
    <Header title={title} className="text-sm" />
    {isSorted &&
      (isSorted === "asc" ? (
        <Icon.ArrowUp className="ml-1 size-3 flex-shrink-0 fill-secondary" />
      ) : (
        <Icon.ArrowDown className="ml-1 size-3 flex-shrink-0 fill-secondary" />
      ))}
  </Button>
);

interface UserCellProps {
  user: MemberRow["user"];
}
export const UserCell = ({ user }: UserCellProps) => {
  return (
    <div className="z-20 flex h-full min-h-[42px] w-[220px] items-center justify-between pr-3">
      <div className="flex w-full items-center gap-2.5">
        <Avatar src={user.avatarUrl} fallback={user.name} className="size-7" />
        <div className="max-w-[164px]">
          <div className="truncate text-sm text-primary">{user.name}</div>
          <div className="truncate text-xs text-secondary">{user.email}</div>
        </div>
      </div>
    </div>
  );
};

interface TeamspacesCellProps {
  teamspaces: MemberRow["teamspaces"];
}
export const TeamspacesCell = ({ teamspaces }: TeamspacesCellProps) => {
  const { options, current } = teamspaces;
  const $options = options.reduce<SelectPresetProps["options"]>(
    (acc, { id, name, memberCount: members }) => ({
      ...acc,
      [id]: {
        label: name,
        description: `${members} members`,
      },
    }),
    {},
  );
  return (
    <div className="flex items-center">
      {options.length < 1 ? (
        <div className="w-auto cursor-default p-2 text-sm text-muted">
          No access
        </div>
      ) : (
        <Select
          className="m-0 w-auto"
          options={$options}
          value={current ?? undefined}
          hideCheck
          align="center"
          renderOption={Custom}
        />
      )}
    </div>
  );
};

interface RoleCellProps {
  className?: string;
  role: Role;
}

export function RoleCell({ className, role }: RoleCellProps) {
  return (
    <div
      className={cn("w-auto cursor-default text-sm text-secondary", className)}
    >
      {roleLabels[role]}
    </div>
  );
}

interface RoleSelectCellProps {
  role: PartialRole;
  scopes?: Set<Scope>;
  onSelect?: (role: PartialRole) => void | Promise<void>;
}
export function RoleSelectCell({
  role,
  scopes,
  onSelect,
}: RoleSelectCellProps) {
  const [select, isUpdating] = useTransition((role: PartialRole) =>
    onSelect?.(role),
  );

  return (
    <div className="flex items-center">
      {scopes?.has(Scope.MemberUpdate) ? (
        <Select
          className="m-0 w-auto"
          options={roleOptions}
          onChange={select}
          value={role}
          align="center"
          renderOption={Custom}
          disabled={isUpdating}
        />
      ) : (
        <RoleCell role={role} />
      )}
    </div>
  );
}

const Custom: SelectPresetProps["renderOption"] = ({ option }) => (
  <div className="min-w-0 truncate text-secondary">
    {typeof option === "string" ? option : option?.label}
  </div>
);

interface MemberActionCellProps {
  isSelf: boolean;
  onDelete?: () => void | Promise<void>;
}

export const MemberActionCell = ({
  isSelf,
  onDelete,
}: MemberActionCellProps) => {
  const [remove, isRemoving] = useTransition(() => onDelete?.());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hint" className="size-5" disabled={isRemoving}>
          <MoreHorizontalIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="error"
            onClick={remove}
            Icon={<Icon.Bye className="size-4" />}
            Body={isSelf ? "Leave workspace" : "Remove from workspace"}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface AccessCellProps {
  access: GuestRow["access"];
}
export const AccessCell = ({ access }: AccessCellProps) => {
  const options = access.reduce<SelectPresetProps["options"]>(
    (acc, { id, name, scope }) => ({
      ...acc,
      [id]: { label: name, description: scope },
    }),
    {},
  );
  return (
    <div className="flex items-center">
      {access.length < 1 ? (
        <div className="w-auto cursor-default p-2 text-sm text-muted">
          No access
        </div>
      ) : (
        <Select
          className="m-0 w-auto"
          options={options}
          hideCheck
          align="center"
          placeholder={`${access.length} pages`}
          renderOption={() => AccessCellDisplay({ pages: access.length })}
        />
      )}
    </div>
  );
};

const AccessCellDisplay = ({ pages }: { pages: number }) => (
  <div className="min-w-0 truncate text-secondary">{`${pages} pages`}</div>
);

interface GuestActionCellProps {
  onUpdate?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export const GuestActionCell = ({
  onUpdate,
  onDelete,
}: GuestActionCellProps) => {
  const [upgrade, isUpgrading] = useTransition(() => onUpdate?.());
  const [remove, isRemoving] = useTransition(() => onDelete?.());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="hint"
          className="size-5"
          disabled={isUpgrading || isRemoving}
        >
          <MoreHorizontalIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            Icon={<CircleArrowUp className="size-4" />}
            Body="Upgrade to member"
            onSelect={upgrade}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="error"
            Icon={<Icon.Bye className="size-4" />}
            Body="Remove from workspace"
            onSelect={remove}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface InvitationActionCellProps {
  onCancel?: () => void | Promise<void>;
}

export function InvitationActionCell({ onCancel }: InvitationActionCellProps) {
  const [cancel, isCancelling] = useTransition(() => onCancel?.());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hint" className="size-5" disabled={isCancelling}>
          <MoreHorizontalIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="error"
            Icon={<Icon.Bye className="size-4" />}
            Body="Cancel invitation"
            onSelect={cancel}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
