import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";

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
      const [data, setData] = useState(mockData);
      const [properties, setProperties] = useState(mockProps);

      return (
        <div className="p-24">
          <TableView
            properties={properties}
            data={data}
            onDataChange={setData}
            onPropertiesChange={setProperties}
          />
        </div>
      );
    },
  ],
};

export const ListView: Story = {
  decorators: [
    () => (
      <div className="px-60 py-24">
        <TableView
          table={{ layout: "list" }}
          properties={mockProps}
          data={mockData}
        />
      </div>
    ),
  ],
};

export const BoardView: Story = {
  decorators: [
    () => (
      <div className="px-60 py-24">
        <TableView
          table={{ layout: "board" }}
          properties={mockProps}
          data={mockData}
        />
      </div>
    ),
  ],
};
