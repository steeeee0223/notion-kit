import { cn } from "@notion-kit/cn";
import { MenuItem } from "@notion-kit/shadcn";

interface SettingsTabProps {
  className?: string;
  name: string;
  isActive: boolean;
  Icon: React.ReactNode;
  onClick?: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  name,
  isActive,
  className,
  ...props
}) => {
  return (
    <MenuItem
      tabIndex={-1}
      role="tab"
      className={cn(
        "px-3 hover:bg-primary/10",
        "[&_svg]:block [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:fill-icon",
        isActive && "bg-primary/10 font-semibold",
        className,
      )}
      Body={name}
      {...props}
    />
  );
};

export { SettingsTab };
