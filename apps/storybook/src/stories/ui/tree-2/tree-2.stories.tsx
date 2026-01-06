import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tree, useTree } from "@notion-kit/tree-2";
import { CommandTree, TreeList } from "@notion-kit/tree-2/presets";

import { folderNodes } from "./data";

const meta = {
  title: "UI/Tree List",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const tree = useTree(folderNodes, {});

    return (
      <Tree tree={tree}>
        <TreeList nodes={folderNodes} />
      </Tree>
    );
  },
};

export const NonCollapsible: Story = {
  render: () => {
    const tree = useTree(folderNodes, { collapsible: false });

    return (
      <Tree tree={tree}>
        <TreeList nodes={folderNodes} />
      </Tree>
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const tree = useTree(folderNodes, { selectionMode: "multiple" });

    return (
      <Tree tree={tree}>
        <TreeList nodes={folderNodes} />
      </Tree>
    );
  },
};

export const Command: Story = {
  render: () => {
    const tree = useTree(folderNodes, {});

    return <CommandTree tree={tree} />;
  },
};
