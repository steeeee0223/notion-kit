import type { Meta, StoryObj } from "@storybook/react";

import { Database } from "./database";

const meta = {
  title: "collections/Table View",
  component: Database,
} satisfies Meta<typeof Database>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="p-24">
        <Story />
      </div>
    ),
  ],
};
