import { TableView } from "@notion-kit/table-view";
import type { DatabaseProperty, RowDataType } from "@notion-kit/table-view";

const mockProps: DatabaseProperty[] = [
  {
    id: "prop-1",
    type: "title",
    name: "Name",
    width: "216px",
    config: {},
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

const mockData: RowDataType[] = [
  {
    id: "row-1",
    properties: {
      "prop-1": { id: "prop-1-1", type: "title", value: "page 1" },
      "prop-2": { id: "prop-1-2", type: "text", value: "desc1" },
      "prop-3": { id: "prop-1-3", type: "checkbox", checked: true },
    },
  },
  {
    id: "row-2",
    properties: {
      "prop-1": { id: "prop-2-1", type: "title", value: "page 2" },
      "prop-2": { id: "prop-2-2", type: "text", value: "desc2" },
      "prop-3": { id: "prop-2-3", type: "checkbox", checked: false },
    },
  },
];

export default function Demo() {
  return <TableView defaultState={{ properties: mockProps, data: mockData }} />;
}
