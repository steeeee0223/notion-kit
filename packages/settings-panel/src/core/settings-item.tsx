import { cn } from "@notion-kit/cn";
import { MenuItem } from "@notion-kit/shadcn";

interface SettingsTabProps {
  className?: string;
  name: string;
  isActive: boolean;
  Icon: React.ReactNode;
  onClick?: () => void;
}

function SettingsTab({
  name,
  isActive,
  className,
  ...props
}: SettingsTabProps) {
  return (
    <MenuItem
      tabIndex={-1}
      role="tab"
      className={cn(
        "px-3",
        isActive && "bg-default/10 font-semibold",
        className,
      )}
      Body={name}
      {...props}
    />
  );
}

export { SettingsTab };
