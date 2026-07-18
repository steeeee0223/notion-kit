import type React from "react";
import { useState } from "react";
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
    const {
      data: propData,
      defaultData,
      properties: propProperties,
      defaultProperties,
      onDataChange,
      onPropertiesChange,
      ...rest
    } = props;
    const [data, setData] = useState(propData ?? defaultData ?? mockData);
    const [properties, setProperties] = useState(
      propProperties ?? defaultProperties ?? mockProperties,
    );

    return (
      <TableView
        {...rest}
        data={data}
        properties={properties}
        onDataChange={(next) => {
          setData(next);
          onDataChange?.(next);
        }}
        onPropertiesChange={(next) => {
          setProperties(next);
          onPropertiesChange?.(next);
        }}
      />
    );
  }

  render(<StatefulTableView />);

  return new TableViewObject(user);
}
