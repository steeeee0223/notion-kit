"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { ThemeProvider, useTheme, type UseThemeProps } from "next-themes";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="nav-icon">
          <SunIcon className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem Body="Light" onSelect={() => setTheme("light")} />
          <DropdownMenuItem Body="Dark" onSelect={() => setTheme("dark")} />
          <DropdownMenuItem Body="System" onSelect={() => setTheme("system")} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeProvider, ThemeToggle, useTheme };
export type { UseThemeProps };
