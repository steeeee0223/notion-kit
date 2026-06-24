import type React from "react";
import { useState } from "react";
import { functionalUpdate } from "@tanstack/react-table";
import { render } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";

import { TableView } from "@/table-contexts";

import { mockData, mockProperties } from "../mock";
import { TableViewObject } from "./table-view";

type TableViewProps = React.ComponentProps<typeof TableView>;

export function renderTableView(props: Partial<TableViewProps> = {}) {
  const user = userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });

  function StatefulTableView() {
    const [data, setData] = useState(props.data ?? mockData);
    const [properties, setProperties] = useState(
      props.properties ?? mockProperties,
    );

    return (
      <TableView
        {...props}
        data={data}
        properties={properties}
        onDataChange={(updater) => {
          setData((prev) => {
            const next = functionalUpdate(updater, prev);
            props.onDataChange?.(next);
            return next;
          });
        }}
        onPropertiesChange={(updater) => {
          setProperties((prev) => {
            const next = functionalUpdate(updater, prev);
            props.onPropertiesChange?.(next);
            return next;
          });
        }}
      />
    );
  }

  render(<StatefulTableView />);

  return new TableViewObject(user);
}
