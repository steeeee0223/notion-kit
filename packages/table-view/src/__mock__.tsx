import type { DatabaseProperty, RowDataType } from "./types";

export const cols: DatabaseProperty[] = [
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

export const mockData: RowDataType[] = [
  {
    id: "15f35e0f-492c-804c-9534-d615e3925074",
    properties: {
      "prop-1": {
        id: "prop-1-1",
        type: "title",
        value: "page 1",
      },
      "prop-2": {
        id: "prop-1-2",
        type: "text",
        value: "desc1",
      },
      "prop-3": {
        id: "prop-1-3",
        type: "checkbox",
        checked: true,
      },
    },
  },
  {
    id: "15f35e0f-492c-809e-b647-f72038f14c5f",
    properties: {
      "prop-1": {
        id: "prop-2-1",
        type: "title",
        value: "page 2",
      },
      "prop-2": {
        id: "prop-2-2",
        type: "text",
        value: "desc2",
      },
      "prop-3": {
        id: "prop-2-3",
        type: "checkbox",
        checked: false,
      },
    },
  },
];
