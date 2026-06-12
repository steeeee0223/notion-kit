import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@notion-kit/ui/primitives";
import { COLOR, type Color } from "@notion-kit/utils";

import { ColorIcon } from "../../../common";
import type { OptionConfig } from "../types";
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
    <DropdownMenuContent
      align="center"
      sideOffset={0}
      className="w-55"
      collisionPadding={12}
    >
      <DropdownMenuGroup>
        <OptionMeta
          option={option}
          validateName={validateName}
          onUpdate={onUpdate}
        />
        <DropdownMenuItem
          variant="warning"
          onClick={onDelete}
          icon={<Icon.Trash />}
          label="Delete"
        />
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel title="Colors" />
        {Object.entries(COLOR).map(([key, color]) => (
          <DropdownMenuCheckboxItem
            key={key}
            icon={<ColorIcon color={color.rgba} />}
            label={color.name}
            checked={option.color === key}
            onCheckedChange={() => onUpdate({ color: key as Color })}
          />
        ))}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}
