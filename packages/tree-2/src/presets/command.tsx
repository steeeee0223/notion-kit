import { useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuItem,
  useCommandState,
} from "@notion-kit/shadcn";

import {
  Tree as TreePrimitive,
  type TreeInstance,
  type TreeNode,
} from "../core";
import type { TreeItemData } from "./utils";

interface CommandTreeProps<T extends TreeItemData> {
  tree: TreeInstance<T>;
}

function CommandTree<T extends TreeItemData>({ tree }: CommandTreeProps<T>) {
  const [input, setInput] = useState("");
  const mode = input === "" ? "browse" : "search";

  return (
    <Command shouldFilter>
      <CommandTreeInput tree={tree} value={input} onValueChange={setInput} />
      <CommandGroup>
        {mode === "browse" ? (
          <CommandList>
            <TreePrimitive tree={tree}>
              <CommandTreeList nodes={tree.original} />
            </TreePrimitive>
          </CommandList>
        ) : (
          <CommandList>
            {Array.from(tree.entity.nodes.entries()).map(([id, node]) => {
              return (
                <CommandItem key={id} value={node.title} asChild>
                  <MenuItem
                    data-slot="tree-item"
                    variant="sidebar"
                    className="focus:shadow-notion"
                    Icon={
                      <Button variant="hint" className="relative size-5">
                        <Icon.EmojiFace />
                      </Button>
                    }
                    Body={node.title}
                  />
                </CommandItem>
              );
            })}
          </CommandList>
        )}
      </CommandGroup>
    </Command>
  );
}

interface CommandTreeInputProps {
  tree: TreeInstance<TreeItemData>;
  value: string;
  onValueChange: (value: string) => void;
}

function CommandTreeInput({
  tree,
  value,
  onValueChange,
}: CommandTreeInputProps) {
  const id = useCommandState((state) => state.selectedItemId);

  return (
    <CommandInput
      placeholder="Type to search..."
      value={value}
      onValueChange={onValueChange}
      onKeyDown={(e) => {
        // only handle in browse mode
        if (value !== "" || !id) return;

        switch (e.key) {
          case "ArrowLeft":
            if (tree.state.expanded.has(id)) tree.expand(id);
            break;
          case "ArrowRight": {
            const firstChild = tree.entity.nodes.get(id)?.children[0];
            if (!firstChild) return;
            if (!tree.state.expanded.has(id)) tree.expand(id);
            break;
          }
        }
      }}
    />
  );
}

function CommandTreeList<T extends TreeItemData>({
  nodes,
}: {
  nodes: TreeNode<T>[];
}) {
  return (
    <TreePrimitive.List<T>
      nodes={nodes}
      renderItem={({ node, tree, expanded }) => {
        return (
          <CommandItem key={node.id} value={node.title} asChild>
            <MenuItem
              id={node.id}
              data-slot="tree-item"
              variant="sidebar"
              className="focus:bg-default/5"
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
                      aria-label={expanded ? "collapse" : "expand"}
                    >
                      <Icon.ChevronDown
                        className={cn(
                          "size-3 rotate-0 transition-[rotate]",
                          !expanded && "-rotate-90",
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
            />
          </CommandItem>
        );
      }}
    />
  );
}

export { CommandTree, CommandTreeList };
