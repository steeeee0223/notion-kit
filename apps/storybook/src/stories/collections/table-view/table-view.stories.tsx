import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { TableView } from "@notion-kit/table-view";

import { Database, mockData, mockProps } from "./database";

const meta = {
  title: "collections/Table View",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const DatabaseView: Story = {
  decorators: [
    () => (
      <div className="p-24">
        <Database />
      </div>
    ),
  ],
};

export const Controlled: Story = {
  decorators: [
    () => {
      const [state, setState] = useState({
        properties: mockProps,
        data: mockData,
      });

      return (
        <div className="p-24">
          <TableView state={state} onStateChange={setState} />
        </div>
      );
    },
  ],
};
