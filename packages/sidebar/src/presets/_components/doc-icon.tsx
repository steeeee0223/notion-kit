"use client";

import { cn } from "@notion-kit/cn";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";
import { Tree, useTreeContext } from "@notion-kit/tree";

import type { TreeData } from "../_lib";

interface DocIconProps {
  node: TreeData;
  defaultIcon: IconData;
}

export function DocIcon({ node, defaultIcon }: DocIconProps) {
  const tree = useTreeContext();
  const expanded = tree.state.expanded.has(node.id);

  return (
    <div className="group/icon">
      <Tree.ExpandIndicator asChild onToggle={() => tree.expand(node.id)}>
        <Button
          variant="hint"
          className="relative hidden size-5 group-hover/icon:flex"
          aria-label={expanded ? "collapse" : "expand"}
        >
          <Icon.ChevronDown
            className={cn(
              "size-3 rotate-0 transition-[rotate]",
              !expanded && "-rotate-90",
            )}
          />
        </Button>
      </Tree.ExpandIndicator>
      <IconBlock
        className="group-hover/icon:hidden"
        icon={node.iconData ?? defaultIcon}
      />
    </div>
  );
}
