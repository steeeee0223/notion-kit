"use client";

import { useState } from "react";

import { createMockTableFixture } from "@notion-kit/table-hook/mock";
import { TableView } from "@notion-kit/table-view";
import type { ColumnDefs, DefaultPlugins, Row } from "@notion-kit/table-view";
import { createMockEditLogApi } from "@notion-kit/table-view/mock";

const { properties: mockProps, data: mockData } = createMockTableFixture();
const editLogs = createMockEditLogApi({
  data: mockData,
  properties: mockProps,
});

export default function Demo() {
  const [data, setData] = useState<Row<DefaultPlugins>[]>(mockData);
  const [properties, setProperties] =
    useState<ColumnDefs<DefaultPlugins>>(mockProps);

  return (
    <div className="w-full min-w-0">
      <p className="mb-3 text-sm text-secondary">
        Edit logs show static sample history. New edits do not add log entries.
      </p>
      <TableView
        {...editLogs}
        properties={properties}
        data={data}
        onDataChange={({ next }) => setData(next)}
        onPropertiesChange={({ next }) => setProperties(next)}
      />
    </div>
  );
}
