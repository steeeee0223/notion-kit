import { ThemeProvider, useTheme, type UseThemeProps } from "next-themes";

import { Icon } from "@notion-kit/icons";

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
      <DropdownMenuTrigger
        render={
          <Button variant="nav-icon">
            <Icon.Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Icon.Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem label="Light" onClick={() => setTheme("light")} />
          <DropdownMenuItem label="Dark" onClick={() => setTheme("dark")} />
          <DropdownMenuItem label="System" onClick={() => setTheme("system")} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeProvider, ThemeToggle, useTheme };
export type { UseThemeProps };
