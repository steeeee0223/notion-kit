import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import type { TeamspacePermission as Permission } from "@/lib/types";
import {
  TeamspacePermission,
  useTeamspacePermissionOptions,
} from "@/presets/_components";

interface PermissionSelectProps {
  workspace: string;
  disabled?: boolean;
  value: Permission;
  onChange: (value: Permission) => void;
}

export function PermissionSelect({
  workspace,
  disabled,
  value,
  onChange,
}: PermissionSelectProps) {
  const permissionOptions = useTeamspacePermissionOptions(workspace);

  return (
    <Select
      items={permissionOptions}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onChange(nextValue);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="h-fit border border-border pl-0">
        <SelectValue>
          {(option) => <TeamspacePermission {...option} />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {permissionOptions.map((option) => (
            <SelectItem key={option.value} {...option} />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
