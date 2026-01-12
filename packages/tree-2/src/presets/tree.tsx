import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button, MenuItem } from "@notion-kit/shadcn";

import {
  Tree as TreePrimitive,
  type TreeNode,
  type TreeNodeInternal,
} from "../core";
import type { TreeItemData } from "./utils";

interface TreeListProps<T extends TreeItemData> {
  nodes: TreeNode<T>[];
  renderAction?: ({ node }: { node: TreeNodeInternal<T> }) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

function TreeList<T extends TreeItemData>({
  nodes,
  renderAction,
  renderEmpty,
}: TreeListProps<T>) {
  return (
    <TreePrimitive.List<T>
      nodes={nodes}
      renderItem={({ node, tree, state }) => {
        return (
          <MenuItem
            data-slot="tree-item"
            variant="sidebar"
            className="focus:shadow-notion"
            Icon={
              <div className="group/icon">
                <TreePrimitive.ExpandIndicator
                  asChild
                  onToggle={() => tree.expand(node.id)}
                >
                  <Button
                    variant="hint"
                    className={cn(
                      "relative size-5",
                      node.icon && "hidden group-hover/icon:flex",
                    )}
                    aria-label={state.expanded ? "collapse" : "expand"}
                  >
                    <Icon.ChevronDown
                      className={cn(
                        "size-3 rotate-0 transition-[rotate]",
                        !state.expanded && "-rotate-90",
                      )}
                    />
                  </Button>
                </TreePrimitive.ExpandIndicator>
                {node.icon && (
                  <div className="flex size-5 items-center justify-center group-hover/icon:hidden">
                    {node.icon}
                  </div>
                )}
              </div>
            }
            Body={node.title}
            children={renderAction?.({ node }) ?? null}
          />
        );
      }}
      renderEmpty={renderEmpty}
    />
  );
}

export { TreeList };
