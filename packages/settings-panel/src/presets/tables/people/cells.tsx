"use client";

import { useTransition } from "react";

import { cn } from "@notion-kit/cn";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { Role } from "@notion-kit/schemas";
import {
  Button,
  Dialog,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SelectPreset as Select,
  type SelectPresetProps,
} from "@notion-kit/shadcn";

import { Scope } from "../../../lib";
import type { GuestRow, MemberRow, PartialRole } from "../../../lib";
import { DeleteGuest, DeleteMember } from "../../modals";
import { roleLabels, roleOptions } from "./constants";

interface TeamspacesCellProps {
  teamspaces: MemberRow["teamspaces"];
  onTeamspaceSelect?: (id: string) => void;
}
export const TeamspacesCell = ({
  teamspaces,
  onTeamspaceSelect,
}: TeamspacesCellProps) => {
  return (
    <div className="flex items-center">
      {teamspaces.length < 1 ? (
        <div className="w-auto cursor-default p-2 text-sm text-muted">
          No access
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="hint" size="xs">
              <span className="text-primary">
                {teamspaces.length} teamspaces
              </span>
              <Icon.ChevronDown className="size-2.5 fill-icon" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              {teamspaces.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => onTeamspaceSelect?.(t.id)}
                  Icon={<IconBlock icon={t.icon} size="sm" />}
                  Body={
                    <div className="flex items-center">
                      <div className="max-w-full shrink-0 truncate">
                        <div className="max-w-25 truncate text-sm leading-5 text-primary">
                          {t.name}
                        </div>
                      </div>
                      <div className="inline-flex truncate text-xs text-muted">
                        <span className="mx-2">—</span>
                        {t.memberCount} members
                      </div>
                    </div>
                  }
                />
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
  const [isUpdating, startTransition] = useTransition();
  const select = (role: PartialRole) =>
    startTransition(async () => await onSelect?.(role));

  return (
    <div className="flex items-center">
      {scopes?.has(Scope.MemberUpdate) ? (
        <Select
          className="w-auto"
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

export function MemberActionCell({ isSelf, onDelete }: MemberActionCellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hint" className="size-5" aria-label="More options">
          <Icon.Dots className="size-4 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem
                variant="error"
                Icon={<Icon.Bye className="size-4" />}
                Body={isSelf ? "Leave workspace" : "Remove from workspace"}
                onSelect={(e) => e.preventDefault()}
              />
            </DialogTrigger>
            <DeleteMember onDelete={onDelete} />
          </Dialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AccessCellProps {
  access: GuestRow["access"];
}
export function AccessCell({ access }: AccessCellProps) {
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
        <div className="min-w-30 cursor-default pl-2 text-sm text-muted">
          No access
        </div>
      ) : (
        <Select
          className="w-auto"
          options={options}
          hideCheck
          align="center"
          placeholder={`${access.length} pages`}
          renderOption={() => AccessCellDisplay({ pages: access.length })}
        />
      )}
    </div>
  );
}

const AccessCellDisplay = ({ pages }: { pages: number }) => (
  <div className="min-w-0 truncate text-secondary">{`${pages} pages`}</div>
);

interface GuestActionCellProps {
  name: string;
  onUpdate?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export function GuestActionCell({
  name,
  onUpdate,
  onDelete,
}: GuestActionCellProps) {
  const [isUpgrading, startTransition] = useTransition();
  const upgrade = () => startTransition(async () => await onUpdate?.());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="hint"
          className="size-5"
          disabled={isUpgrading}
          aria-label="More options"
        >
          <Icon.Dots className="size-4 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            Icon={<Icon.ArrowUpCircled className="size-4" />}
            Body="Upgrade to member"
            onSelect={upgrade}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem
                variant="error"
                Icon={<Icon.Bye className="size-4" />}
                Body="Remove from workspace"
                onSelect={(e) => e.preventDefault()}
              />
            </DialogTrigger>
            <DeleteGuest name={name} onDelete={onDelete} />
          </Dialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface InvitationActionCellProps {
  onCancel?: () => void | Promise<void>;
}

export function InvitationActionCell({ onCancel }: InvitationActionCellProps) {
  const [isCancelling, startTransition] = useTransition();
  const cancel = () => startTransition(async () => await onCancel?.());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="hint"
          className="size-5"
          disabled={isCancelling}
          aria-label="More options"
        >
          <Icon.Dots className="size-4 fill-current" />
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
