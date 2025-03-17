import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { TreeGroup, TreeList } from "@notion-kit/tree";

import { CustomItem } from "./custom-item";
import { folderNodes } from "./data";

const meta = {
  title: "blocks/Tree List",
  component: TreeList,
  parameters: { layout: "centered" },
  argTypes: { Item: { control: false }, selectedId: { type: "string" } },
  tags: ["autodocs"],
} satisfies Meta<typeof TreeList>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nodes: folderNodes,
    defaultIcon: { type: "lucide", name: "file-text" },
    showEmptyChild: true,
  },
};

const RenderWithGroup: Story["render"] = (props) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  return (
    <TreeGroup
      className="bg-sidebar w-60 p-2"
      title="Workspace"
      description="Add a file"
    >
      <TreeList {...props} selectedId={activeFile} onSelect={setActiveFile} />
    </TreeGroup>
  );
};

export const WithGroup: Story = {
  args: {
    nodes: folderNodes,
    defaultIcon: { type: "lucide", name: "file-text" },
    showEmptyChild: true,
  },
  render: RenderWithGroup,
};

export const WithCustomItem: Story = {
  args: {
    nodes: folderNodes,
    defaultIcon: { type: "lucide", name: "file-text" },
    showEmptyChild: true,
    Item: ({ node, isSelected, onSelect, ...props }) => (
      <CustomItem
        {...props}
        id={node.id}
        label={node.title}
        icon={node.icon}
        active={isSelected}
        onClick={onSelect}
      />
    ),
  },
  render: RenderWithGroup,
};
