"use client";

import * as React from "react";

import {
  Badge,
  Button,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxCreatableItem,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@notion-kit/ui/primitives";

const COLORS: Record<string, string> = {
  "Option A": "rgba(227,226,224)",
  "Option B": "rgba(255,226,221)",
  "Option C": "rgba(253,236,200)",
  "Option D": "rgba(219,237,219)",
  "Option E": "rgba(227,226,224)",
  "Option F": "rgba(255,226,221)",
  "Option G": "rgba(253,236,200)",
  "Option H": "rgba(219,237,219)",
  "Option I": "rgba(227,226,224)",
  "Option J": "rgba(255,226,221)",
  "Option K": "rgba(253,236,200)",
  "Option L": "rgba(219,237,219)",
};
const OPTIONS = Object.keys(COLORS);

interface GroupOption {
  label: string;
  items: string[];
  creatable: boolean;
}

interface ComboboxMultipleInlineProps {
  maxChips?: number;
}

export default function ComboboxMultipleInline({
  maxChips = 3,
}: ComboboxMultipleInlineProps) {
  const [value, setValue] = React.useState<string[]>(["Option A"]);
  const [inputValue, setInputValue] = React.useState("");
  const [createdOptions, setCreatedOptions] = React.useState<string[]>([]);
  const [limitReached, setLimitReached] = React.useState(false);

  const options = React.useMemo(
    () => [...OPTIONS, ...createdOptions],
    [createdOptions],
  );

  const items = React.useMemo<GroupOption[]>(() => {
    const res = [
      {
        label: "Select an option or create one",
        items: options,
        creatable: false,
      },
    ];
    const showCreatable =
      inputValue.trim().length > 0 &&
      !options.some(
        (option) => option.toLowerCase() === inputValue.toLowerCase(),
      ) &&
      !value.some(
        (option) => option.toLowerCase() === inputValue.toLowerCase(),
      );
    if (showCreatable) {
      res.push({
        label: "Create option",
        items: [inputValue],
        creatable: true,
      });
    }
    return res;
  }, [inputValue, options, value]);

  const commitValue = React.useCallback(
    (nextValue: string[]) => {
      const addedValue = nextValue.find((item) => !value.includes(item));
      if (addedValue && value.length >= maxChips) {
        setLimitReached(true);
        return;
      }

      if (addedValue && !options.includes(addedValue)) {
        setCreatedOptions((current) => [...current, addedValue]);
      }

      setLimitReached(false);
      setValue(nextValue);
      if (addedValue) setInputValue("");
    },
    [maxChips, options, value],
  );

  return (
    <div className="w-90 rounded-md border border-border bg-input shadow-md">
      <Combobox<string, true>
        multiple
        open
        value={value}
        onValueChange={commitValue}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        items={items}
        filter={null}
      >
        <ComboboxChips variant="inline" hideClearButton>
          <ComboboxValue>
            {(selected: string[]) => (
              <>
                {selected.map((option) => (
                  <ComboboxChip
                    key={option}
                    style={{ backgroundColor: COLORS[option] }}
                  >
                    {option}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Search for an option..." />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent variant="inline">
          <ComboboxList>
            {(group: GroupOption) => (
              <ComboboxGroup key={group.label} items={group.items}>
                <ComboboxLabel title={group.label} />
                {group.creatable ? (
                  <ComboboxCreatableItem value={inputValue} />
                ) : (
                  <ComboboxCollection>
                    {(option: string) => (
                      <ComboboxItem
                        key={option}
                        value={option}
                        label={
                          <Badge
                            variant="tag"
                            style={{ backgroundColor: COLORS[option] }}
                          >
                            {option}
                          </Badge>
                        }
                      />
                    )}
                  </ComboboxCollection>
                )}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <div className="flex items-center justify-between gap-2 border-t border-border p-2">
        <Badge variant="tag">Max {maxChips}</Badge>
        <Button
          type="button"
          variant="hint"
          size="sm"
          onClick={() => setValue([])}
        >
          Clear
        </Button>
      </div>
      {limitReached && (
        <p className="px-2 pb-2 text-sm/tight text-secondary">
          Remove a chip before selecting another option.
        </p>
      )}
    </div>
  );
}
