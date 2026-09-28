import { Icon } from "@notion-kit/icons";
import {
  appendFilterNode,
  createFilterGroup,
  createFilterRule,
} from "@notion-kit/table-hook";
import type { FilterGroup } from "@notion-kit/table-hook";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MenuItem,
} from "@notion-kit/ui/primitives";

import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

interface AddFilterMenuProps {
  root?: FilterGroup;
  parentId?: string;
  depth?: number;
  className?: string;
}

export function AddFilterMenu({
  root,
  parentId = "",
  depth = 1,
  className,
}: AddFilterMenuProps) {
  const { table } = useTableViewCtx();
  const messages = useTableViewMessages();
  const titleRule = table.getTitleFilterRule();
  const canAddGroup = depth < 3;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={!titleRule && !canAddGroup}
        nativeButton={false}
        render={
          <MenuItem
            className={className}
            variant="secondary"
            label={messages.filterMenu.addFilterRule}
            icon={<Icon.Plus className="size-4" />}
          />
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {titleRule && (
            <DropdownMenuItem
              icon={<Icon.Plus className="size-4" />}
              label={messages.filterMenu.addFilterRule}
              onClick={() =>
                table.setFilters(
                  appendFilterNode(
                    root,
                    parentId,
                    createFilterRule(titleRule.propertyId, titleRule.operator),
                  ),
                )
              }
            />
          )}
          {canAddGroup && (
            <DropdownMenuItem
              icon={<Icon.SquareOnSquarePlus />}
              label={messages.filterMenu.addFilterGroup}
              desc={messages.filterMenu.addFilterGroupDesc}
              onClick={() =>
                table.setFilters(
                  appendFilterNode(root, parentId, createFilterGroup()),
                )
              }
            />
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
