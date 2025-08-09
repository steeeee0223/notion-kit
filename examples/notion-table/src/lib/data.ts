import type { ColumnDefs, Row } from "@notion-kit/table-view";

export const mockProps: ColumnDefs = [
  {
    id: "col-1",
    type: "title",
    name: "Name",
    width: "216px",
  },
  {
    id: "col-2",
    type: "text",
    name: "Desc.",
    width: "100px",
  },
  {
    id: "col-3",
    type: "checkbox",
    name: "Released",
    width: "90px",
  },
  {
    id: "col-4",
    type: "multi-select",
    name: "Tags",
    width: "300px",
    config: {
      options: {
        names: ["Done", "Pending", "In Progress", "Not Started"],
        items: {
          Done: { id: "tag1", name: "Done", color: "blue" },
          Pending: { id: "tag2", name: "Pending", color: "green" },
          "In Progress": { id: "tag3", name: "In Progress", color: "red" },
          "Not Started": { id: "tag4", name: "Not Started", color: "gray" },
        },
      },
    },
  },
];

export const mockData: Row[] = [
  {
    id: "row-1",
    properties: {
      "col-1": { id: "col-1-1", value: { value: "TODO 1" } },
      "col-2": { id: "cell-1-2", value: "desc1" },
      "col-3": { id: "cell-1-3", value: true },
      "col-4": { id: "cell-1-4", value: ["Done"] },
    },
  },
  {
    id: "row-2",
    properties: {
      "col-1": { id: "cell-2-1", value: { value: "TODO 2" } },
      "col-2": { id: "cell-2-2", value: "desc2" },
      "col-3": { id: "cell-2-3", value: false },
      "col-4": { id: "cell-2-4", value: ["Not Started"] },
    },
  },
  {
    id: "row-3",
    properties: {
      "col-1": { id: "cell-3-1", value: { value: "TODO 3" } },
      "col-2": { id: "cell-3-2", value: "desc3" },
      "col-3": { id: "cell-3-3", value: false },
      "col-4": { id: "cell-3-4", value: ["Pending"] },
    },
  },
  {
    id: "row-4",
    properties: {
      "col-1": { id: "cell-4-1", value: { value: "TODO 4" } },
      "col-2": { id: "cell-4-2", value: "desc4" },
      "col-3": { id: "cell-4-3", value: true },
      "col-4": { id: "cell-4-4", value: ["Done"] },
    },
  },
  {
    id: "row-5",
    properties: {
      "col-1": { id: "cell-5-1", value: { value: "TODO 5" } },
      "col-2": { id: "cell-5-2", value: "desc5" },
      "col-3": { id: "cell-5-3", value: false },
      "col-4": { id: "cell-5-4", value: ["In Progress"] },
    },
  },
];
