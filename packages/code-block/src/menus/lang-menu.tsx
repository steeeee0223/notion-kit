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
import { CODE_BLOCK_LANGUAGES } from "../constant";

const OPTIONS = [{ value: "Languages", items: CODE_BLOCK_LANGUAGES }];
type OptionGroup = (typeof OPTIONS)[number];
type Language = (typeof CODE_BLOCK_LANGUAGES)[number];

export function LangMenu() {
  const { state, store } = useCodeBlock();
  return (
    <Autocomplete<Language>
      items={OPTIONS}
      itemToStringValue={(lang) => lang.label}
      open
      autoHighlight="always"
      openOnInputClick
    >
      <AutocompleteInput placeholder="Search for a language..." />
      <AutocompleteContent role="presentation" variant="inline">
        <AutocompleteList className="max-h-60">
          {(group: OptionGroup) => (
            <AutocompleteGroup key={group.value} items={group.items}>
              <AutocompleteLabel title={group.value} />
              <AutocompleteCollection>
                {(lang: Language) => (
                  <AutocompleteItem
                    key={lang.value}
                    value={lang}
                    label={lang.label}
                    onClick={() => store.setLang(lang.value)}
                  >
                    {lang.value === state.lang && <MenuItemCheck />}
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
