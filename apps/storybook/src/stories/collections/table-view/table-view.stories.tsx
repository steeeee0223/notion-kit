import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { TableView } from "@notion-kit/table-view";
import type { ColumnDefs, DefaultPlugins, Row } from "@notion-kit/table-view";

import { Database, mockData, mockProps } from "./database";

const meta = {
  title: "collections/Table View",
  parameters: {
    layout: "fullscreen",
  },
  decorators: (Story) => (
    <div className="py-24">
      <Story />
    </div>
  ),
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const DatabaseView: Story = {
  render: () => (
    <div className="px-24">
      <Database />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [data, setData] = useState<Row<DefaultPlugins>[]>(mockData);
    const [properties, setProperties] =
      useState<ColumnDefs<DefaultPlugins>>(mockProps);

    return (
      <TableView
        properties={properties}
        data={data}
        onDataChange={({ next }) => setData(next)}
        onPropertiesChange={({ next }) => setProperties(next)}
      />
    );
  },
};

export const ListView: Story = {
  render: () => (
    <TableView
      defaultView={{ layout: "list" }}
      defaultProperties={mockProps}
      defaultData={mockData}
    />
  ),
};

export const BoardView: Story = {
  render: () => (
    <TableView
      defaultView={{ layout: "board" }}
      defaultProperties={mockProps}
      defaultData={mockData}
    />
  ),
};
