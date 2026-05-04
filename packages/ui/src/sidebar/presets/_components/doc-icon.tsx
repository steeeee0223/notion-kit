import { Icon } from "@notion-kit/icons";

import { IconBlock, type IconData } from "@/icon-block";
import { Button } from "@/primitives";
import { Tree, useTreeContext } from "@/tree";

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
          <Icon.Chevron
            side={expanded ? "down" : "right"}
            className="size-3 transition-[rotate]"
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
