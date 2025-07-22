"use client";

import { Icon } from "@notion-kit/icons";
import {
  MenuGroup,
  MenuItem,
  MenuItemCheck,
  MenuLabel,
  Separator,
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
      <MenuGroup>
        <OptionMeta
          option={option}
          validateName={validateName}
          onUpdate={onUpdate}
        />
        <MenuItem
          variant="warning"
          onClick={onDelete}
          Icon={<Icon.Trash className="size-4" />}
          Body="Delete"
        />
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuLabel title="Colors" />
        {Object.entries(COLOR).map(([key, color]) => (
          <MenuItem
            key={key}
            Icon={<ColorIcon color={color.rgba} />}
            Body={color.name}
            onClick={() => onUpdate({ color: key as Color })}
          >
            {option.color === key && <MenuItemCheck />}
          </MenuItem>
        ))}
      </MenuGroup>
    </>
  );
}
