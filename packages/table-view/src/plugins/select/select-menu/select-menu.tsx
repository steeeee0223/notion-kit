import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxCreatableItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
  getSortableItemsAfterDrag,
  Sortable,
} from "@notion-kit/ui/primitives";
import { COLOR } from "@notion-kit/utils";

import { OptionTag } from "@/common";

import { OptionItem } from "./option-item";
import { SelectMenuApi } from "./use-select-menu";

interface SelectMenuProps {
  menu: SelectMenuApi;
}

interface GroupOption {
  label: string;
  items: string[];
  creatable: boolean;
}

export function SelectMenu({ menu }: SelectMenuProps) {
  const {
    config,
    optionSuggestion,
    tags,
    search,
    setSearch,
    handleTagsChange,
    selectTag,
    addOption,
    reorderOptions,
    validateOptionName,
    updateOption,
    deleteOption,
  } = menu;

  const items: GroupOption[] = [
    {
      label: "Select an option or create one",
      items: config.options.names,
      creatable: false,
    },
  ];

  if (optionSuggestion) {
    items.push({
      label: "Create option",
      items: [optionSuggestion.name],
      creatable: true,
    });
  }

  return (
    <Combobox<string, true>
      multiple
      open
      value={tags.map((tag) => tag.value)}
      inputValue={search}
      onInputValueChange={setSearch}
      onValueChange={handleTagsChange}
      items={items}
    >
      <ComboboxChips variant="inline" hideClearButton className="z-10 max-h-60">
        <ComboboxValue>
          {(selectedValue: string[]) => (
            <>
              {selectedValue.map((value) => {
                const tag = tags.find((item) => item.value === value);

                return (
                  <ComboboxChip
                    key={value}
                    style={{
                      backgroundColor: tag?.color
                        ? COLOR[tag.color].rgba
                        : undefined,
                    }}
                  >
                    {value}
                  </ComboboxChip>
                );
              })}
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
              {group.creatable && optionSuggestion ? (
                <ComboboxCreatableItem
                  value={optionSuggestion.name}
                  onClick={addOption}
                >
                  <div className="flex items-center gap-2 px-1">
                    Create
                    <OptionTag {...optionSuggestion} />
                  </div>
                </ComboboxCreatableItem>
              ) : (
                <Sortable.Root
                  disabled={search !== ""}
                  onDragEnd={(e) => {
                    reorderOptions(getSortableItemsAfterDrag(group.items, e));
                  }}
                >
                  <Sortable.List>
                    {group.items.map((name, index) => {
                      const option = config.options.items[name];
                      if (!option) return;
                      return (
                        <OptionItem
                          key={option.name}
                          option={option}
                          index={index}
                          draggable={search === ""}
                          onSelect={selectTag}
                          onUpdate={(data) => updateOption(name, data)}
                          onDelete={() => deleteOption(name)}
                          validateName={validateOptionName}
                        />
                      );
                    })}
                  </Sortable.List>
                </Sortable.Root>
              )}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
