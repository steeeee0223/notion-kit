"use client";

import { MenuGroup, MenuItem, MenuLabel } from "@notion-kit/shadcn";
import { TagsInput } from "@notion-kit/tags-input";

import { OptionTag, VerticalDnd } from "../../common";
import { OptionItem } from "./option-item";
import { useSelectMenu } from "./use-select-menu";

interface SelectMenuProps {
  propId: string;
  options: string[];
  onUpdate?: (options: string[]) => void;
}

export function SelectMenu(props: SelectMenuProps) {
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
  } = useSelectMenu(props);

  return (
    <>
      <div className="z-10 max-h-[240px] flex-shrink-0 overflow-hidden overflow-y-auto border-b border-border">
        <div className="flex min-w-0 flex-1 flex-col items-stretch">
          <div className="z-10 mr-0 mb-0 flex min-h-[34px] w-full cursor-text flex-nowrap items-start overflow-auto bg-input/60 p-[4px_9px] text-sm dark:bg-input/5">
            <TagsInput
              role="combobox"
              size={1}
              placeholder="Search for an option..."
              value={{ tags, input: search }}
              onTagsChange={handleTagsChange}
              onInputChange={handleInputChange}
              className="min-h-[34px] min-w-0 flex-grow border-none bg-transparent px-0"
            />
          </div>
        </div>
      </div>
      <MenuGroup>
        <MenuLabel title="Select an option or create one" />
        <div className="flex flex-col">
          <VerticalDnd items={results ?? []} onDragEnd={reorderOptions}>
            {results?.map((name) => {
              const option = config.options.items[name];
              if (!option) return;
              return (
                <OptionItem
                  key={option.name}
                  option={option}
                  onSelect={selectTag}
                  onUpdate={(data) => updateOption(name, data)}
                  onDelete={() => deleteOption(name)}
                  validateName={validateOptionName}
                />
              );
            })}
          </VerticalDnd>
          {search && optionSuggestion && (
            <MenuItem
              Body={
                <div className="flex items-center gap-2 px-1">
                  Create
                  <OptionTag {...optionSuggestion} />
                </div>
              }
              onClick={addOption}
            />
          )}
        </div>
      </MenuGroup>
    </>
  );
}
