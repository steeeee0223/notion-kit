import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemAction,
  TooltipPreset,
} from "@notion-kit/ui/primitives";
import type { Color } from "@notion-kit/utils";

import { OptionTag } from "../../../common";
import { SelectOptionMenu } from "../select-option-menu";
import type { OptionConfig } from "../types";

interface OptionItemProps {
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
  option,
  draggable,
  onSelect,
  onUpdate,
  onDelete,
  validateName,
}: OptionItemProps) {
  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: option.name });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <TooltipPreset
      description={
        option.description
          ? [
              { type: "default", text: option.name },
              { type: "secondary", text: option.description },
            ]
          : option.name
      }
      side="left"
      sideOffset={8}
    >
      <MenuItem
        ref={setNodeRef}
        style={style}
        onClick={() => onSelect(option.name)}
        icon={
          draggable ? (
            <div
              className="flex h-6 w-4.5 shrink-0 cursor-grab items-center justify-center [&_svg]:fill-icon"
              {...attributes}
              {...listeners}
            >
              <Icon.DragHandle className="size-3" />
            </div>
          ) : null
        }
        label={<OptionTag {...option} />}
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
      </MenuItem>
    </TooltipPreset>
  );
}
