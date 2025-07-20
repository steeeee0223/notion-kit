"use client";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@notion-kit/shadcn";
import { COLOR, type Color } from "@notion-kit/utils";

import { ColorIcon } from "../../common";
import type { OptionConfig } from "../../lib/types";
import { OptionMeta } from "./option-meta";

interface SelectOptionMenuProps {
  option: OptionConfig;
  validateName: (name: string) => boolean;
  onDelete: () => void;
  onUpdate: (data: {
    name?: string;
    description?: string;
    color?: Color;
  }) => void;
}

export function SelectOptionMenu({
  option,
  validateName,
  onDelete,
  onUpdate,
}: SelectOptionMenuProps) {
  return (
    <>
      <DropdownMenuGroup>
        <OptionMeta
          option={option}
          validateName={validateName}
          onUpdate={onUpdate}
        />
        <DropdownMenuItem
          variant="warning"
          onSelect={onDelete}
          Icon={<Icon.Trash className="size-4" />}
          Body="Delete"
        />
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel title="Colors" />
        {Object.entries(COLOR).map(([key, color]) => (
          <DropdownMenuCheckboxItem
            key={key}
            Icon={<ColorIcon color={color.rgba} />}
            Body={color.name}
            checked={option.color === key}
            onCheckedChange={() => onUpdate({ color: key as Color })}
          />
        ))}
      </DropdownMenuGroup>
    </>
  );
}
