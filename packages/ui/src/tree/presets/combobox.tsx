import { useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  Button,
} from "@/primitives";

import { Tree as TreePrimitive, type TreeInstance } from "../core";
import type { TreeItemData } from "./utils";

interface ComboboxTreeProps<T extends TreeItemData> {
  tree: TreeInstance<T>;
}

function ComboboxTree<T extends TreeItemData>({ tree }: ComboboxTreeProps<T>) {
  const [input, setInput] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | undefined>();
  const mode = input === "" ? "browse" : "search";
  const nodeIds = Array.from(tree.entity.nodes.keys());

  return (
    <Autocomplete
      items={nodeIds}
      itemToStringValue={(id) => tree.entity.nodes.get(id)?.title ?? id}
      mode={mode === "browse" ? "none" : "list"}
      value={input}
      onValueChange={setInput}
      onItemHighlighted={(id) => setHighlightedId(id)}
      open
      autoHighlight="always"
      openOnInputClick
    >
      <ComboboxTreeInput
        tree={tree}
        value={input}
        highlightedId={highlightedId}
      />
      <AutocompleteContent variant="inline">
        {mode === "browse" ? (
          <AutocompleteList>
            <AutocompleteGroup>
              <TreePrimitive tree={tree}>
                <ComboboxTreeList nodeIds={tree.entity.rootIds} />
              </TreePrimitive>
            </AutocompleteGroup>
          </AutocompleteList>
        ) : (
          <AutocompleteList>
            <AutocompleteGroup items={nodeIds}>
              <AutocompleteCollection>
                {(id: string) => {
                  const node = tree.entity.nodes.get(id);
                  if (!node) return null;

                  return (
                    <AutocompleteItem
                      key={id}
                      value={id}
                      data-slot="tree-item"
                      variant="sidebar"
                      className="focus:shadow-notion"
                      icon={
                        <Button variant="hint" className="relative size-5">
                          {node.icon}
                        </Button>
                      }
                      label={node.title}
                    />
                  );
                }}
              </AutocompleteCollection>
            </AutocompleteGroup>
          </AutocompleteList>
        )}
      </AutocompleteContent>
    </Autocomplete>
  );
}

interface ComboboxTreeInputProps {
  tree: TreeInstance<TreeItemData>;
  value: string;
  highlightedId?: string;
}

function ComboboxTreeInput({
  tree,
  value,
  highlightedId,
}: ComboboxTreeInputProps) {
  return (
    <AutocompleteInput
      placeholder="Type to search..."
      onKeyDown={(e) => {
        // only handle in browse mode
        if (value !== "" || !highlightedId) return;

        switch (e.key) {
          case "ArrowLeft":
            if (tree.state.expanded.has(highlightedId)) {
              tree.expand(highlightedId);
            }
            break;
          case "ArrowRight": {
            const firstChild =
              tree.entity.nodes.get(highlightedId)?.children[0];
            if (!firstChild) return;
            if (!tree.state.expanded.has(highlightedId)) {
              tree.expand(highlightedId);
            }
            break;
          }
        }
      }}
    />
  );
}

function ComboboxTreeList<T extends TreeItemData>({
  nodeIds,
}: {
  nodeIds: string[];
}) {
  return (
    <TreePrimitive.List<T>
      nodeIds={nodeIds}
      renderItem={({ node, tree, state }) => {
        return (
          <AutocompleteItem
            key={node.id}
            value={node.title}
            data-slot="tree-item"
            variant="sidebar"
            className="focus:bg-default/5"
            icon={
              <div className="group/icon">
                <TreePrimitive.ExpandIndicator
                  onToggle={() => tree.expand(node.id)}
                  render={
                    <Button
                      variant="hint"
                      className={cn(
                        "relative size-5",
                        node.icon && "hidden group-hover/icon:flex",
                      )}
                      aria-label={state.expanded ? "collapse" : "expand"}
                    >
                      <Icon.Chevron
                        side={state.expanded ? "down" : "right"}
                        className="size-3 rotate-0 transition-[rotate]"
                      />
                    </Button>
                  }
                />
                {node.icon && (
                  <div className="flex size-5 items-center justify-center group-hover/icon:hidden">
                    {node.icon}
                  </div>
                )}
              </div>
            }
            label={node.title}
          />
        );
      }}
    />
  );
}

export { ComboboxTree, ComboboxTreeList };
