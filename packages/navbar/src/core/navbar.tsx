"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { Hint, HintProvider } from "@notion-kit/common";
import { Button } from "@notion-kit/shadcn";

const Navbar = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <HintProvider delayDuration={500}>
    <nav
      className={cn(
        "flex h-12 w-full items-center gap-x-4 bg-main px-3 py-2",
        className,
      )}
      {...props}
    />
  </HintProvider>
);

interface NavbarItemProps extends React.ComponentProps<typeof Button> {
  hint: string;
}

const NavbarItem: React.FC<NavbarItemProps> = ({
  hint,
  className,
  ...props
}) => (
  <Hint description={hint}>
    <Button
      variant="nav-icon"
      className={cn("[&_svg]:block [&_svg]:shrink-0", className)}
      {...props}
    />
  </Hint>
);

export { Navbar, NavbarItem };
