import { ChevronsLeft } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Hint } from "@notion-kit/common";
import { Button } from "@notion-kit/shadcn";

import { useSidebar } from "./sidebar-provider";

export const SidebarRail = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="sidebar-rail"
    className={cn(
      "absolute top-0 right-0 h-full w-1 cursor-ew-resize bg-primary/10 opacity-0 transition group-hover/sidebar:opacity-100",
      className,
    )}
    {...props}
  />
);

export const SidebarClose = ({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <Hint description="Close sidebar">
      <Button
        data-slot="sidebar-close"
        variant="hint"
        onClick={(e) => {
          onClick?.(e);
          toggleSidebar();
        }}
        className={cn(
          "absolute top-3.5 right-3 size-6 opacity-0 transition group-hover/sidebar:opacity-100",
          isMobile && "opacity-100",
          className,
        )}
        {...props}
      >
        <ChevronsLeft className="size-4" />
      </Button>
    </Hint>
  );
};
