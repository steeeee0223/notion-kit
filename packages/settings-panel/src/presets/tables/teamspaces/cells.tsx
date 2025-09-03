import { useState } from "react";

import { useTemporaryFix, useTransition } from "@notion-kit/hooks";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Dialog,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Option,
  SelectPreset as Select,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { Avatar, permissions } from "../../_components";
import { TeamspacePermission, TeamspaceRole } from "../../../lib";
import { LeaveTeamspace } from "../../modals";
import { TextCell } from "../common-cells";

interface TeamspaceCellProps {
  name: string;
  icon: IconData;
  memberCount: number;
}

export function TeamspaceCell({ name, icon, memberCount }: TeamspaceCellProps) {
  return (
    <div className="flex h-14 min-w-[30px] items-center px-1 text-sm text-primary">
      <div className="flex items-center gap-3 overflow-hidden">
        <IconBlock icon={icon} size="md" />
        <div className="flex min-w-0 flex-col">
          <div className="flex">
            <div className="truncate leading-[18px]">{name}</div>
          </div>
          <div className="truncate text-xs text-secondary">
            {memberCount} members • Joined
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccessSelectCellProps {
  workspace: string;
  permission: TeamspacePermission;
  disabled?: boolean;
  onSelect?: (permission: TeamspacePermission) => void | Promise<void>;
}
export function AccessSelectCell({
  workspace,
  permission,
  disabled,
  onSelect,
}: AccessSelectCellProps) {
  const options = { ...permissions };
  options.default.description = permissions.default.getDescription(workspace);

  const [select, isUpdating] = useTransition(
    (permission: TeamspacePermission) => onSelect?.(permission),
  );

  return (
    <div className="flex items-center px-1">
      {disabled ? (
        <TextCell
          className="text-center text-sm"
          value={options[permission].label}
        />
      ) : (
        <Select
          className="w-auto"
          options={options}
          onChange={select}
          value={permission}
          align="center"
          renderOption={({ option }) => (
            <TextCell
              className="min-w-0 text-sm"
              value={(option as Option).label}
            />
          )}
          disabled={isUpdating}
        />
      )}
    </div>
  );
}

interface OwnersCellProps {
  ownedBy: { name: string; avatarUrl?: string };
  count: number;
}

export function OwnersCell({ ownedBy, count }: OwnersCellProps) {
  return (
    <div className="flex h-14 min-w-15 items-center gap-1.5 overflow-hidden px-2 text-sm text-primary">
      <Avatar src={ownedBy.avatarUrl} fallback={ownedBy.name} />
      <div className="contents">
        <div className="shrink truncate">{ownedBy.name}</div>
        {count > 1 && (
          <div className="shrink-0 text-secondary">+{count - 1}</div>
        )}
      </div>
    </div>
  );
}

interface TeamspaceActionCellProps {
  name: string;
  role?: TeamspaceRole | false;
  onViewDetail?: () => void;
  onLeave?: () => void | Promise<void>;
  onArchive?: () => void | Promise<void>;
}

export function TeamspaceActionCell({
  name,
  role,
  onViewDetail,
  onLeave,
  onArchive,
}: TeamspaceActionCellProps) {
  const { onCloseAutoFocus } = useTemporaryFix();
  const [openLeave, setOpenLeave] = useState(false);
  const [archive, isArchiving] = useTransition(() => onArchive?.());

  return (
    <Dialog open={openLeave} onOpenChange={setOpenLeave}>
      <DropdownMenu>
        <TooltipPreset description="Teamspace settings and members...">
          <DropdownMenuTrigger asChild>
            <Button
              variant="hint"
              className="size-5"
              disabled={isArchiving}
              onClick={(e) => e.stopPropagation()}
            >
              <Icon.Dots className="size-4 fill-current" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipPreset>
        <DropdownMenuContent
          className="w-[282px]"
          onClick={(e) => e.stopPropagation()}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={onViewDetail}
              Icon={<Icon.Gear />}
              Body="Teamspace settings"
            />
            <DialogTrigger asChild>
              <DropdownMenuItem
                variant="error"
                Icon={<Icon.Bye className="size-4" />}
                Body="Leave teamspace"
              />
            </DialogTrigger>
            <DropdownMenuItem
              variant="error"
              onClick={archive}
              disabled={role !== "owner"}
              Icon={<Icon.ArchiveBox />}
              Body="Archive teamspace"
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <LeaveTeamspace
        name={name}
        onLeave={onLeave}
        onClose={() => setOpenLeave(false)}
      />
    </Dialog>
  );
}

const teamspaceRoles = {
  owner: {
    label: "Teamspace owner",
    description:
      "Can edit teamspace settings and full access to teamspace pages.",
  },
  member: {
    label: "Teamspace member",
    description:
      "Cannot edit teamspace settings and can access teamspace pages.",
  },
};

interface TeamMemberActionCellProps {
  role: TeamspaceRole;
  onUpdate?: (role: TeamspaceRole) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
}

export function TeamMemberActionCell({
  role,
  onUpdate,
  onRemove,
}: TeamMemberActionCellProps) {
  const [update, isUpdating] = useTransition((role: TeamspaceRole) =>
    onUpdate?.(role),
  );
  const [remove, isRemoving] = useTransition(() => onRemove?.());
  const disabled = isUpdating || isRemoving;

  return (
    <DropdownMenu>
      <TooltipPreset description="Teamspace settings and members...">
        <DropdownMenuTrigger asChild>
          <Button variant="hint" size="xs" disabled={disabled}>
            <span className="text-primary">{teamspaceRoles[role].label}</span>
            <Icon.ChevronDown className="size-3 fill-current" />
          </Button>
        </DropdownMenuTrigger>
      </TooltipPreset>
      <DropdownMenuContent className="w-[288px]">
        <DropdownMenuGroup>
          {Object.entries(teamspaceRoles).map(
            ([key, { label, description }]) => (
              <DropdownMenuCheckboxItem
                key={key}
                disabled={role === "member"}
                checked={role === key}
                onClick={() => update(key as TeamspaceRole)}
                Body={
                  <div className="flex flex-col items-start gap-0.5 py-1">
                    <div className="truncate">{label}</div>
                    <div className="text-xs whitespace-normal text-secondary">
                      {description}
                    </div>
                  </div>
                }
              />
            ),
          )}
          <DropdownMenuItem variant="error" onClick={remove} Body="Remove" />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
