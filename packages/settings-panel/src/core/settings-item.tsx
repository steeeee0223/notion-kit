import { cn } from "@notion-kit/cn";
import { MenuItem } from "@notion-kit/ui/primitives";

interface SettingsTabProps {
  className?: string;
  name: string;
  isActive: boolean;
  icon: React.ReactNode;
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
      variant="sidebar"
      aria-selected={isActive}
      className={cn("px-3", className)}
      label={name}
      {...props}
    />
  );
}

export { SettingsTab };
