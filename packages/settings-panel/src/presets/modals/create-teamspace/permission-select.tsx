import { SelectPreset as Select } from "@notion-kit/shadcn";

import { permissions, TeamspacePermission } from "../../_components";
import type { TeamspacePermission as Permission } from "../../../lib";

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
  const options = { ...permissions };
  options.default.description = permissions.default.getDescription(workspace);

  return (
    <Select
      className="h-fit border border-border pl-0"
      value={value}
      onChange={(val) => onChange(val)}
      disabled={disabled}
      options={options}
      renderOption={({ option }) => {
        if (typeof option === "string" || typeof option === "undefined")
          return null as never;
        return <TeamspacePermission {...option} />;
      }}
    />
  );
}
