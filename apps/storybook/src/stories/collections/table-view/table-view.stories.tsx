import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import TableViewCalendar from "@notion-kit/registry/table-view-calendar";
import { TableView } from "@notion-kit/table-view";
import type { ColumnDefs, DefaultPlugins, Row } from "@notion-kit/table-view";

import { Database, mockData, mockEditLogs, mockProps } from "./database";

const meta = {
  title: "collections/Table View",
  parameters: {
    layout: "fullscreen",
  },
  decorators: (Story) => (
    <div className="py-24">
      <p className="mb-3 px-24 text-sm text-secondary">
        Edit logs show static sample history. New edits do not add log entries.
      </p>
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
        {...mockEditLogs}
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
      {...mockEditLogs}
      defaultView={{ layout: "list" }}
      defaultProperties={mockProps}
      defaultData={mockData}
    />
  ),
};

export const BoardView: Story = {
  render: () => (
    <TableView
      {...mockEditLogs}
      defaultView={{ layout: "board" }}
      defaultProperties={mockProps}
      defaultData={mockData}
    />
  ),
};

export const TimelineView: Story = {
  render: () => (
    <TableView
      {...mockEditLogs}
      defaultView={{
        layout: "timeline",
        dateView: {
          range: "monthly",
        },
      }}
      defaultProperties={mockProps}
      defaultData={mockData}
    />
  ),
};

export const CalendarView: Story = { render: () => <TableViewCalendar /> };
