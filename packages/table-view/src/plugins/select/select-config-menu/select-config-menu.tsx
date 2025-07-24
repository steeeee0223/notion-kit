"use client";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuItem,
} from "@notion-kit/shadcn";

import { VerticalDnd } from "../../../common";
import type { ConfigMeta, SelectSort } from "../../../lib/types";
import { OptionItem } from "./option-item";
import { useSelectConfigMenu } from "./use-select-config-menu";

const sortOptions: { label: string; value: SelectSort }[] = [
  { label: "Manual", value: "manual" },
  { label: "Alphabetical", value: "alphabetical" },
  { label: "Reverse alphabetical", value: "reverse-alphabetical" },
];

interface SelectConfigMenuProps {
  propId: string;
  meta: ConfigMeta<"select" | "multi-select">;
}

export function SelectConfigMenu({ propId, meta }: SelectConfigMenuProps) {
  const { config } = meta;

  const {
    addOption,
    reorderOptions,
    validateOptionName,
    updateOption,
    updateSort,
    deleteOption,
  } = useSelectConfigMenu({ propId, meta });

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        Icon={<Icon.Sliders className="fill-icon" />}
        Body="Edit property"
      />
      <DropdownMenuSubContent className="w-[250px]">
        <DropdownMenuGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MenuItem Icon={<Icon.ArrowUpDown />} Body="Sort"></MenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              alignOffset={4}
              sideOffset={0}
              className="w-[250px]"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuGroup>
                {sortOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    Body={option.label}
                    checked={config.sort === option.value}
                    onCheckedChange={() => updateSort(option.value)}
                  />
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel title="Options" />
          <div className="flex flex-col">
            <VerticalDnd
              items={config.options.names}
              onDragEnd={reorderOptions}
            >
              {config.options.names.map((name) => {
                const option = config.options.items[name];
                if (!option) return;
                return (
                  <OptionItem
                    key={option.name}
                    option={option}
                    onUpdate={(data) => updateOption(name, data)}
                    onDelete={() => deleteOption(name)}
                    validateName={validateOptionName}
                  />
                );
              })}
            </VerticalDnd>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
