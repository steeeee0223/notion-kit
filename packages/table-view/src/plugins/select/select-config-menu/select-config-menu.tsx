"use client";

import { useEffect, useState } from "react";

import { useInputField } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  MenuItem,
  MenuItemAction,
} from "@notion-kit/shadcn";

import { VerticalDnd } from "../../../common";
import type { ConfigMenuProps } from "../../types";
import type { SelectConfig, SelectSort } from "../types";
import { OptionItem } from "./option-item";
import { useSelectConfigMenu } from "./use-select-config-menu";

const sortOptions: { label: string; value: SelectSort }[] = [
  { label: "Manual", value: "manual" },
  { label: "Alphabetical", value: "alphabetical" },
  { label: "Reverse alphabetical", value: "reverse-alphabetical" },
];

export function SelectConfigMenu({
  config,
  ...props
}: ConfigMenuProps<SelectConfig>) {
  const {
    addOption,
    reorderOptions,
    validateOptionName,
    updateOption,
    updateSort,
    deleteOption,
  } = useSelectConfigMenu({ config, ...props });

  const [showInput, setShowInput] = useState(false);
  const nameField = useInputField({
    id: "name",
    initialValue: "",
    validate: validateOptionName,
    onUpdate: (name) => {
      if (name) addOption(name);
      setShowInput(false);
    },
  });
  const toggleInput = () =>
    setShowInput((prev) => {
      if (prev) nameField.reset();
      else nameField.ref.current?.focus();
      return !prev;
    });

  useEffect(() => {
    if (!showInput) return;
    nameField.ref.current?.focus();
  }, [nameField.ref, showInput]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger Icon={<Icon.Sliders />} Body="Edit property" />
      <DropdownMenuSubContent className="w-[250px]">
        <DropdownMenuGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MenuItem Icon={<Icon.ArrowUpDown />} Body="Sort">
                <MenuItemAction className="flex items-center text-muted">
                  {sortOptions.find((o) => o.value === config.sort)?.label}
                  <Icon.ChevronRight className="transition-out ml-1.5 h-full w-3 fill-icon" />
                </MenuItemAction>
              </MenuItem>
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
          <DropdownMenuLabel title="Options" className="relative">
            <Button
              variant="hint"
              className="absolute top-0 right-2 size-5 [&_svg]:size-3.5"
              onClick={toggleInput}
            >
              {!showInput ? <Icon.Plus /> : <Icon.Close />}
            </Button>
          </DropdownMenuLabel>
          {showInput && (
            <div className="mb-2 flex flex-col gap-2 px-3">
              <div className="flex w-full min-w-0 flex-auto items-center select-none">
                <Input {...nameField.props} />
              </div>
              {nameField.error && (
                <div className="text-sm text-red">Option already exists.</div>
              )}
            </div>
          )}
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
