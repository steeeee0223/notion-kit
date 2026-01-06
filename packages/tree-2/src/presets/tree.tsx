import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import { Tree as TreePrimitive, useTreeContext } from "../core/";
// import { Tree as TreePrimitive, useTreeContext } from "@notion-kit/tree-2";

import { TreeItemData, TreeNode } from "./utils";

interface TreeListProps<T extends TreeItemData> {
  nodes: TreeNode<T>[];
  level?: number;
  withCheckbox?: boolean;
}

function TreeList<T extends TreeItemData>({
  nodes,
  level = 1,
  withCheckbox = false,
}: TreeListProps<T>) {
  const tree = useTreeContext();

  return (
    <>
      {nodes.map((node) => {
        const groupId = `group:${node.id}`;

        const hasChildren = !!node.children.length;
        const expanded = (() => {
          if (!hasChildren) return false;
          if (!tree.collapsible) return true;
          return tree.expanded.has(node.id);
        })();

        return (
          <div key={node.id}>
            <TreePrimitive.Item
              style={{ paddingLeft: `${level * 16}px` }}
              className="inline-flex h-7 w-100 items-center gap-1.5 px-2 outline-none focus-within:shadow-notion aria-selected:bg-blue/30"
              id={node.id}
              level={level}
              hasChildren={hasChildren}
              expanded={expanded}
              aria-owns={groupId}
            >
              <TreePrimitive.ExpandIndicator
                asChild
                onToggle={() => tree.expand(node.id)}
              >
                <Button
                  variant="hint"
                  className="size-5 [&_svg]:size-3 [&_svg]:fill-icon"
                >
                  {!hasChildren || !tree.collapsible ? (
                    <Icon.EmojiFace />
                  ) : expanded ? (
                    <Icon.ChevronDown />
                  ) : (
                    <Icon.ChevronRight />
                  )}
                </Button>
              </TreePrimitive.ExpandIndicator>

              {node.title}

              {withCheckbox && tree.selected.has(node.id) && (
                <Icon.Check className="ml-auto size-3 fill-primary" />
              )}
            </TreePrimitive.Item>

            {expanded && (
              <TreePrimitive.Group id={groupId}>
                <TreeList
                  nodes={node.children}
                  level={level + 1}
                  withCheckbox={withCheckbox}
                />
              </TreePrimitive.Group>
            )}
          </div>
        );
      })}
    </>
  );
}

export { TreeList };
