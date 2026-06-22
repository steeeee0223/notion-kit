import { useEffect, useState } from "react";

import { useInputField } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  Input,
  MenuItemAction,
  Sortable,
} from "@notion-kit/ui/primitives";

import type { ConfigMenuProps } from "../../types";
import type { SelectConfig, SelectSort } from "../types";
import { OptionItem } from "./option-item";
import { useSelectConfigMenu } from "./use-select-config-menu";

const sortOptions: { label: string; value: SelectSort }[] = [
  { label: "Manual", value: "manual" },
  { label: "Alphabetical", value: "alphabetical" },
  { label: "Reverse alphabetical", value: "reverse-alphabetical" },
];

interface SelectConfigMenuProps extends ConfigMenuProps<SelectConfig> {
  multi?: boolean;
}

export function SelectConfigMenu({
  multi,
  config,
  ...props
}: SelectConfigMenuProps) {
  const {
    addOption,
    reorderOptions,
    validateOptionName,
    updateOption,
    updateSort,
    deleteOption,
  } = useSelectConfigMenu({ multi, config, ...props });

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
      <DropdownMenuSubTrigger icon={<Icon.Sliders />} label="Edit property" />
      <DropdownMenuContent sideOffset={-4} className="w-[250px]">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              icon={<Icon.ArrowUpDown />}
              label="Sort"
              aria-label="Sort options"
            >
              <MenuItemAction className="flex items-center text-muted">
                {sortOptions.find((o) => o.value === config.sort)?.label}
              </MenuItemAction>
            </DropdownMenuSubTrigger>
            <DropdownMenuContent
              align="start"
              alignOffset={4}
              sideOffset={-4}
              className="w-[250px]"
              finalFocus={false}
            >
              <DropdownMenuGroup>
                {sortOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    label={option.label}
                    checked={config.sort === option.value}
                    onCheckedChange={() => updateSort(option.value)}
                  />
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel title="Options" className="relative">
            <Button
              variant="hint"
              className="absolute top-0 right-2 size-5"
              onClick={toggleInput}
              aria-label={showInput ? "Close" : "Add"}
            >
              {!showInput ? (
                <Icon.Plus className="size-3.5" />
              ) : (
                <Icon.Close className="size-3.5" />
              )}
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
            <Sortable.Root
              items={config.options.names}
              onItemsChange={(orderedIds) =>
                reorderOptions(orderedIds.map(String))
              }
            >
              <Sortable.List>
                {config.options.names.map((name, index) => {
                  const option = config.options.items[name];
                  if (!option) return;
                  return (
                    <OptionItem
                      key={option.name}
                      option={option}
                      index={index}
                      onUpdate={(data) => updateOption(name, data)}
                      onDelete={() => deleteOption(name)}
                      validateName={validateOptionName}
                    />
                  );
                })}
              </Sortable.List>
            </Sortable.Root>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}
