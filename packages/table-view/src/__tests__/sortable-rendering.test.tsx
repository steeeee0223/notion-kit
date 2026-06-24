import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TableView } from "../table-contexts";
import { mockData, mockProperties, mockResizeObserver } from "./mock";

mockResizeObserver();

describe("TableView sortable rendering", () => {
  it("renders rows and columns through the shared sortable primitive", async () => {
    await act(async () => {
      render(<TableView properties={mockProperties} data={mockData} />);
      await Promise.resolve();
    });

    expect(
      document.querySelector("[data-slot='sortable-list']"),
    ).toBeInTheDocument();
    expect(
      document.querySelectorAll("[data-slot='sortable-item']").length,
    ).toBeGreaterThan(1);
    expect(
      document.querySelector("[data-slot='sortable-handle']"),
    ).toBeInTheDocument();
  });
});
