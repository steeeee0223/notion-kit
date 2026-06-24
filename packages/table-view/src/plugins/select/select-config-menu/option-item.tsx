import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  Sortable,
} from "@notion-kit/ui/primitives";
import type { Color } from "@notion-kit/utils";

import { OptionTag } from "../../../common";
import { SelectOptionMenu } from "../select-option-menu";
import type { OptionConfig } from "../types";

interface OptionItemProps {
  index: number;
  option: OptionConfig;
  onUpdate: (data: {
    name?: string;
    description?: string;
    color?: Color;
  }) => void;
  onDelete: () => void;
  validateName: (name: string) => boolean;
}

export function OptionItem({
  index,
  option,
  onUpdate,
  onDelete,
  validateName,
}: OptionItemProps) {
  return (
    <DropdownMenuSub>
      <Sortable.Item
        id={option.name}
        index={index}
        render={
          <DropdownMenuSubTrigger
            icon={
              <Sortable.Handle
                aria-label={`Move ${option.name}`}
                className="h-6 w-4.5"
                onPointerDown={(event) => event.stopPropagation()}
              />
            }
            label={<OptionTag {...option} />}
            chevron={false}
            openOnHover={false}
          />
        }
      />
      <SelectOptionMenu
        option={option}
        validateName={validateName}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </DropdownMenuSub>
  );
}
