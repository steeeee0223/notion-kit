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
    config: { showIcon: true },
  },
  {
    id: "prop-2",
    type: "text",
    name: "Desc.",
    width: "100px",
  },
  {
    id: "prop-3",
    type: "number",
    name: "Score",
    width: "100px",
    config: mockNumberConfig,
  },
  {
    id: "prop-4",
    type: "checkbox",
    name: "Done",
    width: "90px",
  },
  {
    id: "prop-5",
    type: "select",
    name: "Status",
    width: "120px",
    config: mockSelectConfig,
  },
  {
    id: "prop-6",
    type: "multi-select",
    name: "Tags",
    width: "140px",
    config: mockSelectConfig,
  },
  {
    id: "prop-7",
    type: "email",
    name: "Email",
    width: "180px",
  },
  {
    id: "prop-8",
    type: "phone",
    name: "Phone",
    width: "140px",
  },
  {
    id: "prop-9",
    type: "url",
    name: "URL",
    width: "180px",
  },
  {
    id: "prop-10",
    type: "date",
    name: "Due",
    width: "140px",
    config: mockDateConfig,
  },
  {
    id: "prop-11",
    type: "created-time",
    name: "Created",
    width: "160px",
    config: mockDateConfig,
  },
  {
    id: "prop-12",
    type: "last-edited-time",
    name: "Updated",
    width: "160px",
    config: mockDateConfig,
  },
];

const now = Date.now();
const timeData = { createdAt: now, lastEditedAt: now };
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
        value: "42",
      },
      "prop-4": {
        id: "prop-1-4",
        value: true,
      },
      "prop-5": {
        id: "prop-1-5",
        value: "In progress",
      },
      "prop-6": {
        id: "prop-1-6",
        value: ["In progress", "Backlog"],
      },
      "prop-7": {
        id: "prop-1-7",
        value: "ada@example.com",
      },
      "prop-8": {
        id: "prop-1-8",
        value: "+1 555 0100",
      },
      "prop-9": {
        id: "prop-1-9",
        value: "https://notion-kit.dev",
      },
      "prop-10": {
        id: "prop-1-10",
        value: { start: now + 86_400_000 },
      },
      "prop-11": {
        id: "prop-1-11",
        value: null,
      },
      "prop-12": {
        id: "prop-1-12",
        value: null,
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
        value: "7",
      },
      "prop-4": {
        id: "prop-2-4",
        value: false,
      },
      "prop-5": {
        id: "prop-2-5",
        value: "Done",
      },
      "prop-6": {
        id: "prop-2-6",
        value: ["Done"],
      },
      "prop-7": {
        id: "prop-2-7",
        value: "grace@example.com",
      },
      "prop-8": {
        id: "prop-2-8",
        value: "+1 555 0101",
      },
      "prop-9": {
        id: "prop-2-9",
        value: "https://example.com",
      },
      "prop-10": {
        id: "prop-2-10",
        value: { start: now + 172_800_000, includeTime: true },
      },
      "prop-11": {
        id: "prop-2-11",
        value: null,
      },
      "prop-12": {
        id: "prop-2-12",
        value: null,
      },
    },
    ...timeData,
  },
];
