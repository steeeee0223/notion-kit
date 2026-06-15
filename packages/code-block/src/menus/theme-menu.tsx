import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  MenuItemCheck,
} from "@notion-kit/ui/primitives";

import { useCodeBlock } from "../code-block-provider";
import { CODE_BLOCK_THEMES } from "../constant";

const OPTIONS = [{ value: "Themes", items: CODE_BLOCK_THEMES }];
type OptionGroup = (typeof OPTIONS)[number];
type Theme = (typeof CODE_BLOCK_THEMES)[number];

export function ThemeMenu() {
  const { state, store } = useCodeBlock();

  return (
    <Autocomplete<Theme>
      items={OPTIONS}
      itemToStringValue={(theme) => theme.label}
      open
      autoHighlight="always"
      openOnInputClick
    >
      <AutocompleteInput placeholder="Search themes..." />
      <AutocompleteContent
        role="presentation"
        variant="inline"
        className="bg-popover"
      >
        <AutocompleteList className="max-h-60">
          {(group: OptionGroup) => (
            <AutocompleteGroup key={group.value} items={group.items}>
              <AutocompleteLabel title={group.value} />
              <AutocompleteCollection>
                {(theme: Theme) => (
                  <AutocompleteItem
                    key={theme.value}
                    value={theme}
                    label={theme.label}
                    onClick={() => store.setTheme(theme.value)}
                  >
                    {theme.value === state.theme && <MenuItemCheck />}
                  </AutocompleteItem>
                )}
              </AutocompleteCollection>
            </AutocompleteGroup>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
