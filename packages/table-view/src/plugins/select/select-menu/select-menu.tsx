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
  Sortable,
} from "@notion-kit/ui/primitives";
import { COLOR, type Color } from "@notion-kit/utils";

import { OptionTag } from "../../../common";
import { OptionItem } from "./option-item";
import { SelectMenuApi } from "./use-select-menu";

interface SelectMenuProps {
  menu: SelectMenuApi;
}

type GroupOption =
  | {
      label: string;
      items: string[];
      creatable: false;
    }
  | {
      label: string;
      items: string[];
      creatable: true;
      option: {
        name: string;
        color: Color;
      };
    };

export function SelectMenu({ menu }: SelectMenuProps) {
  const {
    config,
    tags,
    optionSuggestion,
    search,
    results,
    handleInputChange,
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
      items: results ?? [],
      creatable: false,
    },
  ];

  if (search && optionSuggestion) {
    items.push({
      label: "Create option",
      items: [search],
      creatable: true,
      option: optionSuggestion,
    });
  }

  return (
    <Combobox<string, true>
      multiple
      open
      value={tags.map((tag) => tag.value)}
      inputValue={search}
      onInputValueChange={handleInputChange}
      onValueChange={handleTagsChange}
      items={items}
      filter={null}
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
              {group.creatable ? (
                <ComboboxCreatableItem value={search} onClick={addOption}>
                  <div className="flex items-center gap-2 px-1">
                    Create
                    <OptionTag
                      name={group.option.name}
                      color={group.option.color}
                    />
                  </div>
                </ComboboxCreatableItem>
              ) : (
                <div className="flex flex-col">
                  <Sortable.Root
                    items={group.items}
                    disabled={search !== ""}
                    onItemsChange={(orderedIds) =>
                      reorderOptions(orderedIds.map(String))
                    }
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
                </div>
              )}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
