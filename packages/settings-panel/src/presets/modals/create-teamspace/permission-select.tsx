import { Icon } from "@notion-kit/icons";
import { MenuItem, SelectPreset as Select } from "@notion-kit/shadcn";

import type { TeamspacePermission } from "../../../lib";

export const permissions = {
  default: {
    label: "Default",
    icon: <Icon.Globe className="size-5" />,
    description: "",
    getDescription: (workspace: string) =>
      `Everyone at ${workspace} must be a member`,
  },
  open: {
    label: "Open",
    icon: <Icon.Teamspace className="size-5" />,
    description: "Anyone can see and join this teamspace",
  },
  closed: {
    label: "Closed",
    icon: <Icon.People className="size-5" />,
    description: "Anyone can see this teamspace but not join",
  },
  private: {
    label: "Private",
    icon: <Icon.Lock className="size-5" />,
    description: "Only members can see that this teamspace exists",
  },
};

interface PermissionSelectProps {
  workspace: string;
  disabled?: boolean;
  value: TeamspacePermission;
  onChange: (value: TeamspacePermission) => void;
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
        return (
          <MenuItem
            className="h-10 w-full"
            Icon={option.icon}
            Body={
              <div className="flex flex-col items-start gap-0.5 p-1">
                <div className="truncate">{option.label}</div>
                <div className="truncate text-xs text-secondary">
                  {option.description}
                </div>
              </div>
            }
          />
        );
      }}
    />
  );
}
