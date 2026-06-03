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

interface GroupOption {
  label: string;
  items: string[];
  creatable: boolean;
}

const OPTIONS = ["React", "Vue", "Svelte", "Angular", "Solid"];

interface ComboboxMultipleFloatingProps {
  maxChips?: number;
}

export default function ComboboxMultipleFloating({
  maxChips = 3,
}: ComboboxMultipleFloatingProps) {
  const [value, setValue] = React.useState<string[]>(["React"]);
  const [inputValue, setInputValue] = React.useState("");
  const [limitReached, setLimitReached] = React.useState(false);

  const items = React.useMemo<GroupOption[]>(() => {
    const res = [{ label: "Frameworks", items: OPTIONS, creatable: false }];
    const showCreatable =
      inputValue.trim().length > 0 &&
      !OPTIONS.some(
        (option) => option.toLowerCase() === inputValue.toLowerCase(),
      ) &&
      !value.some(
        (option) => option.toLowerCase() === inputValue.toLowerCase(),
      );
    if (showCreatable) {
      res.push({
        label: "Add new framework",
        items: [inputValue],
        creatable: true,
      });
    }
    return res;
  }, [inputValue, value]);

  return (
    <div className="flex w-80 flex-col gap-2">
      <Combobox<string, true>
        multiple
        autoHighlight
        items={items}
        value={value}
        onValueChange={(nextValue) => {
          const addedValue = nextValue.find((item) => !value.includes(item));
          if (addedValue && value.length >= maxChips) {
            setLimitReached(true);
            return;
          }

          setLimitReached(false);
          setValue(nextValue);
          if (addedValue) setInputValue("");
        }}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      >
        <ComboboxChips className="w-full cursor-text py-1 pl-2">
          <ComboboxValue>
            {(selected: string[]) => (
              <>
                {selected.map((option) => (
                  <ComboboxChip key={option}>{option}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={
                    selected.length === 0 ? "Select frameworks..." : ""
                  }
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            {(group: GroupOption) => (
              <ComboboxGroup key={group.label} items={group.items}>
                <ComboboxLabel title={group.label} />
                {group.creatable ? (
                  <ComboboxCreatableItem value={inputValue} />
                ) : (
                  <ComboboxCollection>
                    {(item: string) => <ComboboxItem key={item} value={item} />}
                  </ComboboxCollection>
                )}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <div className="flex items-center justify-between gap-2">
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
        <p className="text-sm/tight text-secondary">
          Remove a chip before selecting another option.
        </p>
      )}
    </div>
  );
}
