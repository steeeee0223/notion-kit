import { useTransition } from "@notion-kit/hooks";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
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
        <TextCell className="text-sm" value={permission} />
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
  ownerName: string;
  ownerAvatarUrl?: string;
  count: number;
}

export function OwnersCell({
  ownerName,
  ownerAvatarUrl,
  count,
}: OwnersCellProps) {
  return (
    <div className="flex h-14 min-w-15 items-center gap-1.5 overflow-hidden px-2 text-sm text-primary">
      <Avatar src={ownerAvatarUrl} fallback={ownerName} />
      <div className="contents">
        <div className="shrink truncate">{ownerName}</div>
        {count > 1 && (
          <div className="shrink-0 text-secondary">+{count - 1}</div>
        )}
      </div>
    </div>
  );
}

interface TeamspaceActionCellProps {
  onLeave?: () => void | Promise<void>;
  onArchive?: () => void | Promise<void>;
}

export function TeamspaceActionCell({
  onLeave,
  onArchive,
}: TeamspaceActionCellProps) {
  const [leave, isLeaving] = useTransition(() => onLeave?.());
  const [archive, isArchiving] = useTransition(() => onArchive?.());
  const disabled = isLeaving || isArchiving;

  return (
    <DropdownMenu>
      <TooltipPreset description="Teamspace settings and members...">
        <DropdownMenuTrigger asChild>
          <Button variant="hint" className="size-5" disabled={disabled}>
            <Icon.Dots className="size-4 fill-current" />
          </Button>
        </DropdownMenuTrigger>
      </TooltipPreset>
      <DropdownMenuContent
        className="w-[282px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem Icon={<Icon.Gear />} Body="Teamspace settings" />
          <DropdownMenuItem
            variant="error"
            onClick={leave}
            Icon={<Icon.Bye className="size-4" />}
            Body="Leave teamspace"
          />
          <DropdownMenuItem
            variant="error"
            onClick={archive}
            Icon={<Icon.ArchiveBox />}
            Body="Archive teamspace"
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
