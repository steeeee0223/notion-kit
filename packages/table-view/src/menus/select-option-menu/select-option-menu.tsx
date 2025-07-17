"use client";

import type { Updater } from "@tanstack/react-table";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@notion-kit/shadcn";

import { Color, COLOR } from "../../lib/colors";
import type { OptionConfig } from "../../lib/types";
import { OptionMeta } from "./option-meta";

interface SelectOptionMenuProps {
  config: OptionConfig;
  validateName: (name: string) => boolean;
  onUpdate: (updater: Updater<OptionConfig>) => void;
}

export function SelectOptionMenu({
  config,
  validateName,
  onUpdate,
}: SelectOptionMenuProps) {
  return (
    <>
      <DropdownMenuGroup>
        <OptionMeta
          config={config}
          validateName={validateName}
          onUpdate={onUpdate}
        />
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Colors</DropdownMenuLabel>
        {Object.entries(COLOR).map(([key, value]) => (
          <DropdownMenuCheckboxItem
            key={key}
            Body={value.name}
            checked={config.color === key}
            onCheckedChange={() =>
              onUpdate((prev) => ({ ...prev, color: key as Color }))
            }
          />
        ))}
      </DropdownMenuGroup>
    </>
  );
}
