import { useTransition } from "@notion-kit/hooks";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Option,
  SelectPreset as Select,
} from "@notion-kit/shadcn";

import { Avatar } from "../../_components";
import { TeamspacePermission } from "../../../lib";
import { permissions } from "../../modals/create-teamspace/permission-select";
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
    <div className="flex h-14 min-w-15 items-center gap-1.5 overflow-hidden text-sm text-primary">
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
      <DropdownMenuTrigger asChild>
        <Button variant="hint" className="size-5" disabled={disabled}>
          <Icon.Dots className="size-4 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[282px]">
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
