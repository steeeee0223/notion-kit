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
            label="Add filter rule"
            icon={<Icon.Plus className="size-4" />}
          />
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {titleRule && (
            <DropdownMenuItem
              icon={<Icon.Plus className="size-4" />}
              label="Add filter rule"
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
              label="Add filter group"
              desc="A group to nest more filters"
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
