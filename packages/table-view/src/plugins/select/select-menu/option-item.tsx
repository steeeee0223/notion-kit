import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemAction,
  Sortable,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";
import type { Color } from "@notion-kit/utils";

import { OptionTag } from "../../../common";
import { SelectOptionMenu } from "../select-option-menu";
import type { OptionConfig } from "../types";

interface OptionItemProps {
  index: number;
  option: OptionConfig;
  draggable?: boolean;
  onSelect: (value: string) => void;
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
  draggable,
  onSelect,
  onUpdate,
  onDelete,
  validateName,
}: OptionItemProps) {
  return (
    <TooltipPreset
      description={
        option.description ? (
          <>
            <TooltipDescription text={option.name} />
            <TooltipDescription type="secondary" text={option.description} />
          </>
        ) : (
          option.name
        )
      }
      side="left"
      sideOffset={8}
    >
      <Sortable.Item
        id={option.name}
        index={index}
        disabled={!draggable}
        render={
          <MenuItem
            onClick={() => onSelect(option.name)}
            icon={
              draggable ? (
                <Sortable.Handle
                  aria-label={`Move ${option.name}`}
                  className="h-6 w-4.5"
                />
              ) : null
            }
            label={<OptionTag {...option} />}
          />
        }
      >
        <MenuItemAction className="flex items-center text-muted">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  tabIndex={0}
                  variant="hint"
                  className="size-5"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="More"
                >
                  <Icon.Dots className="size-3.5 fill-current" />
                </Button>
              }
            />
            <SelectOptionMenu
              option={option}
              validateName={validateName}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </DropdownMenu>
        </MenuItemAction>
      </Sortable.Item>
    </TooltipPreset>
  );
}
