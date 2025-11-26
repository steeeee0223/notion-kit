import type { ColumnDefs, Row } from "@notion-kit/table-view";

export const mockProps: ColumnDefs = [
  {
    id: "prop-1",
    type: "title",
    name: "Name",
    width: "216px",
  },
  {
    id: "prop-2",
    type: "text",
    name: "Desc.",
    width: "100px",
  },
  {
    id: "prop-3",
    type: "checkbox",
    name: "Done",
    width: "90px",
  },
];

const timeData = { createdAt: Date.now(), lastEditedAt: Date.now() };
export const mockData: Row[] = [
  {
    id: "row-1",
    properties: {
      "prop-1": {
        id: "prop-1-1",
        value: "page 1",
      },
      "prop-2": {
        id: "prop-1-2",
        value: "desc1",
      },
      "prop-3": {
        id: "prop-1-3",
        value: true,
      },
    },
    ...timeData,
  },
  {
    id: "row-2",
    properties: {
      "prop-1": {
        id: "prop-2-1",
        value: "page 2",
      },
      "prop-2": {
        id: "prop-2-2",
        value: "desc2",
      },
      "prop-3": {
        id: "prop-2-3",
        value: false,
      },
    },
    ...timeData,
  },
];
