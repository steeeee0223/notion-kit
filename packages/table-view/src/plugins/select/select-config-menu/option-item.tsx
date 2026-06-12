import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";
import type { Color } from "@notion-kit/utils";

import { OptionTag } from "../../../common";
import { SelectOptionMenu } from "../select-option-menu";
import type { OptionConfig } from "../types";

interface OptionItemProps {
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
  option,
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
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        ref={setNodeRef}
        style={style}
        icon={
          <div
            key="drag-handle"
            className="flex h-6 w-4.5 shrink-0 cursor-grab items-center justify-center [&_svg]:fill-default/45"
            onPointerDown={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <Icon.DragHandle className="size-3" />
          </div>
        }
        label={<OptionTag {...option} />}
        chevron={false}
        openOnHover={false}
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
