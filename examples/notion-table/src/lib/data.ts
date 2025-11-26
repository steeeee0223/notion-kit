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
          "Under Review": { id: "tag5", name: "Under Review", color: "purple" },
        },
      },
    },
  },
  {
    id: "col-5",
    type: "number",
    name: "Progress",
    width: "90px",
    config: {
      format: "percent",
      round: "0",
      showAs: "ring",
      options: { color: "blue", divideBy: 100, showNumber: true },
    },
  },
  {
    id: "col-6",
    type: "date",
    name: "Due Date",
    config: {
      dateFormat: "full",
      timeFormat: "hidden",
    },
  },
];

const timeData = { createdAt: Date.now(), lastEditedAt: Date.now() };
export const mockData: Row[] = [
  {
    id: "row-1",
    properties: {
      "col-1": { id: "col-1-1", value: "TODO 1" },
      "col-2": { id: "cell-1-2", value: "desc1" },
      "col-3": { id: "cell-1-3", value: true },
      "col-4": { id: "cell-1-4", value: ["Done"] },
      "col-5": { id: "cell-1-5", value: "100" },
      "col-6": { id: "cell-1-6", value: { start: Date.now() } },
    },
    ...timeData,
  },
  {
    id: "row-2",
    properties: {
      "col-1": { id: "cell-2-1", value: "TODO 2" },
      "col-2": { id: "cell-2-2", value: "desc2" },
      "col-3": { id: "cell-2-3", value: false },
      "col-4": { id: "cell-2-4", value: ["Not Started"] },
      "col-5": { id: "cell-2-5", value: "0" },
      "col-6": { id: "cell-2-6", value: { start: Date.UTC(2026, 1, 1) } },
    },
    ...timeData,
  },
  {
    id: "row-3",
    properties: {
      "col-1": { id: "cell-3-1", value: "TODO 3" },
      "col-2": { id: "cell-3-2", value: "desc3" },
      "col-3": { id: "cell-3-3", value: false },
      "col-4": { id: "cell-3-4", value: ["Pending"] },
      "col-5": { id: "cell-3-5", value: "0" },
      "col-6": { id: "cell-3-6", value: { start: Date.now() } },
    },
    ...timeData,
  },
  {
    id: "row-4",
    properties: {
      "col-1": { id: "cell-4-1", value: "TODO 4" },
      "col-2": { id: "cell-4-2", value: "desc4" },
      "col-3": { id: "cell-4-3", value: true },
      "col-4": { id: "cell-4-4", value: ["Under Review"] },
      "col-5": { id: "cell-4-5", value: "85" },
      "col-6": { id: "cell-4-6", value: { start: Date.UTC(2026, 1, 1) } },
    },
    ...timeData,
  },
  {
    id: "row-5",
    properties: {
      "col-1": { id: "cell-5-1", value: "TODO 5" },
      "col-2": { id: "cell-5-2", value: "desc5" },
      "col-3": { id: "cell-5-3", value: false },
      "col-4": { id: "cell-5-4", value: ["In Progress"] },
      "col-5": { id: "cell-5-5", value: "40" },
      "col-6": { id: "cell-5-6", value: { start: Date.now() } },
    },
    ...timeData,
  },
];
