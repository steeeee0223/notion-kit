import { useState } from "react";
import { functionalUpdate } from "@tanstack/react-table";
import { render } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";

import type {
  ColumnDefs,
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

import { TableViewObject } from "@/__tests__/component-objects/table-view";
import { TableView } from "@/table-contexts";

import { SelectConfigMenuContent } from "../select-config-menu";
import type { SelectConfig } from "../types";

export const selectConfig: SelectConfig = {
  options: {
    names: ["Option A", "Option B", "Option C"],
    items: {
      "Option A": { id: "opt-a", name: "Option A", color: "blue" },
      "Option B": { id: "opt-b", name: "Option B", color: "green" },
      "Option C": { id: "opt-c", name: "Option C", color: "orange" },
    },
  },
  sort: "manual",
};

const mockProperties: ColumnDefs = [
  {
    id: "title-col",
    type: "title",
    name: "Name",
    width: "200px",
  },
  {
    id: "select-col",
    type: "select",
    name: "Status",
    width: "150px",
    config: selectConfig,
  },
  {
    id: "multi-select-col",
    type: "multi-select",
    name: "Tags",
    width: "200px",
    config: selectConfig,
  },
];

function createMockData(options?: {
  preselected?: "single" | "multi" | "both";
}): Row[] {
  const { preselected } = options ?? {};
  const timeData = { createdAt: Date.now(), lastEditedAt: Date.now() };

  return [
    {
      id: "row-1",
      properties: {
        "title-col": { id: "cell-1-1", value: "Row 1" },
        "select-col": {
          id: "cell-1-2",
          value:
            preselected === "single" || preselected === "both"
              ? "Option A"
              : null,
        },
        "multi-select-col": {
          id: "cell-1-3",
          value:
            preselected === "multi" || preselected === "both"
              ? ["Option A", "Option B"]
              : [],
        },
      },
      ...timeData,
    },
    {
      id: "row-2",
      properties: {
        "title-col": { id: "cell-2-1", value: "Row 2" },
        "select-col": { id: "cell-2-2", value: null },
        "multi-select-col": { id: "cell-2-3", value: [] },
      },
      ...timeData,
    },
  ];
}

interface RenderSelectTableOptions {
  onDataChange?: (change: ResourceChange<Row[], DataResourceAction>) => void;
  preselected?: "single" | "multi" | "both";
}

export function renderSelectTable(options?: RenderSelectTableOptions) {
  const user = userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });

  function StatefulSelectTable() {
    const [data, setData] = useState(createMockData(options));
    const [properties, setProperties] = useState(mockProperties);

    return (
      <TableView
        properties={properties}
        data={data}
        onDataChange={(change) => {
          setData(change.next);
          options?.onDataChange?.(change);
        }}
        onPropertiesChange={({ next }) => setProperties(next)}
      />
    );
  }

  render(<StatefulSelectTable />);
  return new TableViewObject(user);
}

export function renderSelectConfigMenuTable(
  options?: RenderSelectTableOptions,
) {
  const user = userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });

  function StatefulSelectConfigMenuTable() {
    const [data, setData] = useState(createMockData(options));
    const [properties, setProperties] = useState(mockProperties);
    const config = (properties.find((property) => property.id === "select-col")
      ?.config ?? selectConfig) as SelectConfig;

    return (
      <TableView
        properties={properties}
        data={data}
        onDataChange={(change) => {
          setData(change.next);
          options?.onDataChange?.(change);
        }}
        onPropertiesChange={({ next }) => setProperties(next)}
      >
        <DropdownMenu defaultOpen modal={false}>
          <DropdownMenuTrigger
            render={<button type="button">Open select config</button>}
          />
          <DropdownMenuContent>
            <SelectConfigMenuContent
              propId="select-col"
              config={config}
              onChange={(updater) =>
                setProperties((prev) =>
                  prev.map((property) =>
                    property.id === "select-col"
                      ? {
                          ...property,
                          config: functionalUpdate(
                            updater,
                            property.config ?? selectConfig,
                          ),
                        }
                      : property,
                  ),
                )
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableView>
    );
  }

  render(<StatefulSelectConfigMenuTable />);
  return new TableViewObject(user);
}
