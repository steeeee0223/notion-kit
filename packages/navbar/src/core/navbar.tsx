"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { Button, TooltipPreset, TooltipProvider } from "@notion-kit/shadcn";

const Navbar = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <TooltipProvider delayDuration={500}>
    <nav
      className={cn(
        "flex h-12 w-full items-center gap-x-4 bg-main px-3 py-2",
        className,
      )}
      {...props}
    />
  </TooltipProvider>
);

interface NavbarItemProps extends React.ComponentProps<typeof Button> {
  hint: string;
}

const NavbarItem: React.FC<NavbarItemProps> = ({
  hint,
  className,
  ...props
}) => (
  <TooltipPreset description={hint}>
    <Button
      variant="nav-icon"
      className={cn("[&_svg]:block [&_svg]:shrink-0", className)}
      {...props}
    />
  </TooltipPreset>
);

export { Navbar, NavbarItem };
