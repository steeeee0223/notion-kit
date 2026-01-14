import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Tree, useTree } from "@notion-kit/tree";
import { CommandTree, TreeList } from "@notion-kit/tree/presets";

import { folderNodes } from "./data";

const meta = {
  title: "Notion UI/Tree List",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const tree = useTree(folderNodes, {});

    return (
      <Tree tree={tree} className="w-40">
        <TreeList nodeIds={tree.entity.rootIds} />
      </Tree>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify tree structure is built from flat data
    const tree = canvas.getByRole("tree");
    await expect(tree).toBeInTheDocument();

    // Check root nodes are visible
    await expect(
      canvas.getByRole("treeitem", { name: "Folder 1" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("treeitem", { name: "Folder 2" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("treeitem", { name: "Folder 3" }),
    ).toBeInTheDocument();

    // Children should not be visible initially (collapsed)
    await expect(canvas.queryByText("Folder A")).not.toBeInTheDocument();
    await expect(canvas.queryByText("File B")).not.toBeInTheDocument();

    // Test expand functionality
    const folder1 = canvas.getByRole("treeitem", { name: "Folder 1" });
    await expect(folder1.ariaExpanded).toBe("false");

    // Click to expand Folder 1
    const expandButton = folder1.querySelector('[aria-label="expand"]');
    if (expandButton) {
      await userEvent.click(expandButton);

      // Children should now be visible
      await expect(
        canvas.getByRole("treeitem", { name: "Folder A" }),
      ).toBeInTheDocument();
      await expect(
        canvas.getByRole("treeitem", { name: "File B" }),
      ).toBeInTheDocument();

      // Check aria-expanded changed
      await expect(folder1.ariaExpanded).toBe("true");
    }
  },
};

export const NonCollapsible: Story = {
  render: () => {
    const tree = useTree(folderNodes, { collapsible: false });

    return (
      <Tree tree={tree} className="w-40">
        <TreeList nodeIds={tree.entity.rootIds} />
      </Tree>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // All nodes should be visible when non-collapsible
    await expect(canvas.getByText("Folder 1")).toBeInTheDocument();
    await expect(canvas.getByText("Folder A")).toBeInTheDocument();
    await expect(canvas.getByText("File 1 in folder A")).toBeInTheDocument();
    await expect(canvas.getByText("File B")).toBeInTheDocument();
    await expect(canvas.getByText("Folder 2")).toBeInTheDocument();
    await expect(canvas.getByText("File C")).toBeInTheDocument();
    await expect(canvas.getByText("File D")).toBeInTheDocument();
    await expect(canvas.getByText("Folder 3")).toBeInTheDocument();

    // Verify proper nesting levels
    const folderA = canvas.getByRole("treeitem", {
      name: "Folder A",
    });
    await expect(folderA.ariaLevel).toBe("2");

    const fileInA = canvas.getByRole("treeitem", {
      name: "File 1 in folder A",
    });
    await expect(fileInA.ariaLevel).toBe("3");
  },
};

export const MultiSelect: Story = {
  render: () => {
    const tree = useTree(folderNodes, { selectionMode: "multiple" });

    return (
      <Tree tree={tree} className="w-40">
        <TreeList nodeIds={tree.entity.rootIds} />
      </Tree>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Tree should render with proper ARIA
    const tree = canvas.getByRole("tree");
    await expect(tree).toBeInTheDocument();

    // Get tree items
    const folder1Item = canvas.getByRole("treeitem", { name: "Folder 1" });
    const folder2Item = canvas.getByRole("treeitem", { name: "Folder 2" });

    // Click to select Folder 1
    await userEvent.click(folder1Item);
    await expect(folder1Item.ariaSelected).toBe("true");

    // Click to select Folder 2 (in multi-select mode, both should be selected)
    await userEvent.click(folder2Item);
    await expect(folder2Item.ariaSelected).toBe("true");

    // Folder 1 should still be selected (multi-select)
    await expect(folder1Item.ariaSelected).toBe("true");
  },
};

export const ShowingEmptyChild: Story = {
  render: () => {
    const tree = useTree(folderNodes, { showEmptyChild: true });

    return (
      <Tree tree={tree} className="w-40">
        <TreeList nodeIds={tree.entity.rootIds} />
      </Tree>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Expand Folder 3 which has no children
    const folder3 = canvas.getByRole("treeitem", { name: "Folder 3" });

    const expandButton = folder3.querySelector('[aria-label="expand"]');
    if (expandButton) {
      await userEvent.click(expandButton);

      // Should show empty indicator
      const emptyIndicator = canvas.getByRole("group");
      await expect(emptyIndicator).toHaveTextContent("No items");
    }
  },
};

export const Command: Story = {
  render: () => {
    const tree = useTree(folderNodes, {});

    return <CommandTree tree={tree} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Command tree should have a search input
    const searchInput = canvas.getByPlaceholderText(/type to search/i);
    await expect(searchInput).toBeInTheDocument();

    // Should render tree items in browse mode
    await expect(canvas.getByText("Folder 1")).toBeInTheDocument();
    await expect(canvas.getByText("Folder 2")).toBeInTheDocument();

    // Test search functionality
    await userEvent.type(searchInput, "folder");

    // In search mode, matching items should be visible
    await expect(canvas.getByText("Folder A")).toBeInTheDocument();
    await expect(canvas.getByText("Folder 2")).toBeInTheDocument();
  },
};
