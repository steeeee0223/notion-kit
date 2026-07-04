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
      <SelectTrigger className="h-fit justify-between border border-border pl-0 text-left">
        <SelectValue>
          {(value: Permission) => {
            const permission = permissionOptions.find(
              (option) => option.value === value,
            );
            return (
              <TeamspacePermission
                className="hover:bg-transparent data-highlighted:bg-transparent"
                {...permission}
              />
            );
          }}
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
