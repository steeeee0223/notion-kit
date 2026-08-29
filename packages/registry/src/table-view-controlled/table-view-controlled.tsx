"use client";

import { useState } from "react";

import { createMockTableFixture } from "@notion-kit/table-hook/mock";
import { TableView } from "@notion-kit/table-view";
import type { ColumnDefs, DefaultPlugins, Row } from "@notion-kit/table-view";

const { properties: mockProps, data: mockData } = createMockTableFixture();

export default function Demo() {
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
}
