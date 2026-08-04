import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { TableView } from "@/table-contexts";

import {
  mockData,
  mockProperties,
  mockResizeObserver,
} from "../__tests__/mock";

mockResizeObserver();

it("TableHeaderCell_StandardRendering_ExposesReusableAccessibleSlots", () => {
  render(
    <TableView
      data={mockData}
      properties={mockProperties}
      view={{ locked: false }}
    />,
  );

  expect(screen.getByRole("button", { name: "Name" })).toHaveAttribute(
    "data-table-header-slot",
    "table-header-cell-trigger",
  );
  expect(
    screen.getByRole("separator", { name: "Resize Name" }),
  ).toHaveAttribute("data-table-header-slot", "table-header-cell-resizer");
});
