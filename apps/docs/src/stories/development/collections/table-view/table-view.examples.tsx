import { useState } from "react";
import type { ReactNode } from "react";

import { TableView } from "@notion-kit/table-view";
import type { ColumnDefs, DefaultPlugins, Row } from "@notion-kit/table-view";

import { Database, mockData, mockEditLogs, mockProps } from "./database";

const ExampleLayout = ({ children }: { children: ReactNode }) => (
  <div className="py-24">
    <p className="mb-3 px-24 text-sm text-secondary">
      Edit logs show static sample history. New edits do not add log entries.
    </p>
    {children}
  </div>
);

const DatabaseViewContent = () => {
  return (
    <div className="px-24">
      <Database />
    </div>
  );
};

export function DatabaseViewExample() {
  return (
    <ExampleLayout>
      <DatabaseViewContent />
    </ExampleLayout>
  );
}

const ControlledContent = () => {
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
};

export function ControlledExample() {
  return (
    <ExampleLayout>
      <ControlledContent />
    </ExampleLayout>
  );
}

const ListViewContent = () => {
  return (
    <TableView
      {...mockEditLogs}
      defaultView={{ layout: "list" }}
      defaultProperties={mockProps}
      defaultData={mockData}
    />
  );
};

export function ListViewExample() {
  return (
    <ExampleLayout>
      <ListViewContent />
    </ExampleLayout>
  );
}

const BoardViewContent = () => {
  return (
    <TableView
      {...mockEditLogs}
      defaultView={{ layout: "board" }}
      defaultProperties={mockProps}
      defaultData={mockData}
    />
  );
};

export function BoardViewExample() {
  return (
    <ExampleLayout>
      <BoardViewContent />
    </ExampleLayout>
  );
}

const TimelineViewContent = () => {
  return (
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
  );
};

export function TimelineViewExample() {
  return (
    <ExampleLayout>
      <TimelineViewContent />
    </ExampleLayout>
  );
}
