import type {
  ColumnDefs,
  DateConfig,
  NumberConfig,
  Row,
  SelectConfig,
} from "@notion-kit/table-view";

export const mockDateConfig: DateConfig = {
  dateFormat: "MM/dd/yyyy",
  timeFormat: "24-hour",
};

export const mockNumberConfig: NumberConfig = {
  format: "number",
  round: "default",
  options: { color: "green", divideBy: 100, showNumber: true },
  showAs: "number",
};

export const mockSelectConfig: SelectConfig = {
  sort: "manual",
  options: {
    names: ["In progress", "Done", "Backlog"],
    items: {
      "In progress": {
        id: "option-1",
        name: "In progress",
        color: "yellow",
      },
      Done: {
        id: "option-2",
        name: "Done",
        color: "green",
      },
      Backlog: {
        id: "option-3",
        name: "Backlog",
        color: "gray",
      },
    },
  },
};

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
