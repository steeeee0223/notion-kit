import type { OptionConfig } from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  Sortable,
} from "@notion-kit/ui/primitives";
import type { Color } from "@notion-kit/utils";

import { OptionTag } from "../../../common";
import { SelectOptionMenu } from "../select-option-menu";

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
                onPointerDown={(e) => e.stopPropagation()}
              />
            }
            label={<OptionTag name={option.name} color={option.color} />}
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
