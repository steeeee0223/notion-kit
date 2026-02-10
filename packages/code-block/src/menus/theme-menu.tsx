import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuItem,
  MenuItemCheck,
} from "@notion-kit/shadcn";

import { useCodeBlock } from "../code-block-provider";
import { CODE_BLOCK_THEMES } from "../constant";

export function ThemeMenu() {
  const { state, store } = useCodeBlock();

  return (
    <Command className="bg-popover">
      <CommandInput placeholder="Search themes..." />
      <CommandList className="max-h-60">
        <CommandGroup heading="Themes">
          {CODE_BLOCK_THEMES.map((theme) => (
            <CommandItem
              asChild
              key={theme.value}
              value={theme.value}
              onSelect={() => store.setTheme(theme.value)}
            >
              <MenuItem Body={theme.label}>
                {theme.value === state.theme && <MenuItemCheck />}
              </MenuItem>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
