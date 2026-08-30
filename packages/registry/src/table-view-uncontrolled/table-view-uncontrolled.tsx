"use client";

import { createMockTableFixture } from "@notion-kit/table-hook/mock";
import { TableView } from "@notion-kit/table-view";

const { properties: mockProps, data: mockData } = createMockTableFixture();

export default function Demo() {
  return <TableView defaultProperties={mockProps} defaultData={mockData} />;
}
