"use client";

import { useState } from "react";

import { useFilter } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Badge,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@notion-kit/shadcn";
import { TagsInput } from "@notion-kit/tags-input";

import { COLOR } from "../lib/colors";
import { OptionConfig, SelectConfig } from "../lib/types";

type SelectMenuProps = SelectConfig & {
  onUpdate?: (values: string[]) => void;
};

export function SelectMenu({ config }: SelectMenuProps) {
  /** Input & Filter */
  const [options, setOptions] = useState<string[]>([]);
  const { search, results, updateSearch } = useFilter(
    Object.values(config.options),
    (option, v) => option.name.includes(v),
    { default: "all" },
  );

  const onInputChange = (input: string) => {
    updateSearch(input);
  };
  const onTagSelect = (value: string) => {
    setOptions((prev) => [...prev, value]);
    onInputChange("");
  };

  return (
    <CommandDialog
      open
      className="flex w-[480px] min-w-[180px] flex-col"
      shouldFilter={false}
    >
      <div className="z-10 max-h-[240px] flex-shrink-0 overflow-hidden overflow-y-auto border-b border-border">
        <div className="flex min-w-0 flex-1 flex-col items-stretch">
          <div className="z-10 mr-0 mb-0 flex min-h-[34px] w-full cursor-text flex-nowrap items-start overflow-auto bg-input/60 p-[4px_9px] text-sm dark:bg-input/5">
            <TagsInput
              role="combobox"
              type="email"
              size={1}
              placeholder="Search name or emails"
              autoComplete="off"
              value={{ tags: options, input: search }}
              onTagsChange={setOptions}
              onInputChange={onInputChange}
              className="min-h-[34px] min-w-0 flex-grow border-none bg-transparent px-0"
            />
          </div>
        </div>
      </div>
      <CommandList className="max-h-[300px] min-h-0 flex-grow transform overflow-auto overflow-x-hidden">
        <CommandGroup className="min-h-[200px]">
          <div className="my-1.5 flex fill-current px-2 text-xs leading-5 font-medium text-default/45 select-none">
            <div className="self-center overflow-hidden overflow-ellipsis whitespace-nowrap">
              Select
            </div>
          </div>
          <CommandEmpty className="flex min-h-7 items-center px-2 py-0 leading-[1.2] text-secondary select-none">
            <span>Type or paste in emails above, separated by commas.</span>
          </CommandEmpty>
          {results?.map((option) => (
            <Item key={option.id} option={option} onSelect={onTagSelect} />
          ))}
        </CommandGroup>
      </CommandList>
      <CommandSeparator />
    </CommandDialog>
  );
}

interface ItemProps {
  option: OptionConfig;
  onSelect?: (value: string) => void;
}

function Item({ option, onSelect }: ItemProps) {
  return (
    <CommandItem
      className="leading-[1.2]"
      key={option.id}
      value={option.name}
      onSelect={onSelect}
    >
      <div className="mr-2.5 flex items-center justify-center">
        <Icon.DragHandle className="size-5 flex-shrink-0 text-primary" />
      </div>
      <div className="mr-3 min-w-0 flex-auto truncate">
        <Badge
          variant="tag"
          size="sm"
          className="h-5 max-w-full min-w-0 shrink-0 text-sm leading-5"
          style={{ backgroundColor: COLOR[option.color].rgba }}
        >
          <span className="truncate">{option.name}</span>
        </Badge>
      </div>
    </CommandItem>
  );
}
