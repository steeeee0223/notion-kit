"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { Button, TooltipPreset, TooltipProvider } from "@notion-kit/shadcn";

function Navbar({ className, ...props }: React.ComponentProps<"nav">) {
  return (
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
}

interface NavbarItemProps extends React.ComponentProps<typeof Button> {
  hint: string;
}

function NavbarItem({ hint, className, ...props }: NavbarItemProps) {
  return (
    <TooltipPreset description={hint}>
      <Button
        variant={null}
        aria-label={hint}
        className={cn("h-7 px-2 text-primary", className)}
        {...props}
      />
    </TooltipPreset>
  );
}

export { Navbar, NavbarItem };
export type { NavbarItemProps };
