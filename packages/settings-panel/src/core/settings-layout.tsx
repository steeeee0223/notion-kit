import React from "react";

import { cn } from "@notion-kit/cn";

const SettingsPanel = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex h-[calc(100vh-100px)] max-h-[720px] w-[calc(100vw-100px)] max-w-[1150px] shadow-lg",
      className,
    )}
    {...props}
  />
);

const SettingsSidebar = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "w-[240px] shrink-0 grow-0 overflow-y-auto rounded-l-lg bg-[#fbfbfa] py-1 dark:bg-default/5",
      className,
    )}
    {...props}
  />
);

const SettingsSidebarGroup = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("py-2", className)} {...props} />
);

const SettingsSidebarTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("px-4 py-1 text-xs font-semibold text-secondary", className)}
    {...props}
  />
);

const SettingsContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "w-full grow-1 overflow-x-hidden overflow-y-scroll rounded-r-lg bg-modal px-15 py-9",
      className,
    )}
    {...props}
  />
);

export {
  SettingsPanel,
  SettingsSidebar,
  SettingsSidebarGroup,
  SettingsSidebarTitle,
  SettingsContent,
};
