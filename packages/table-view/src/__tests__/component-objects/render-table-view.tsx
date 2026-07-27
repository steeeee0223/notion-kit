import type React from "react";
import { useState } from "react";
import { render } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";

import { TableView } from "@/table-contexts";

import { mockData, mockProperties } from "../mock";
import { TableViewObject } from "./table-view";

export type TableViewProps = React.ComponentProps<typeof TableView>;

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
      view: propView,
      defaultView,
      onDataChange,
      onPropertiesChange,
      onViewChange,
      ...rest
    } = props;
    const [data, setData] = useState(propData ?? defaultData ?? mockData);
    const [properties, setProperties] = useState(
      propProperties ?? defaultProperties ?? mockProperties,
    );
    const [view, setView] = useState(propView ?? defaultView ?? {});

    return (
      <TableView
        {...rest}
        data={data}
        properties={properties}
        view={view}
        onDataChange={(change) => {
          setData(change.next);
          onDataChange?.(change);
        }}
        onPropertiesChange={(change) => {
          setProperties(change.next);
          onPropertiesChange?.(change);
        }}
        onViewChange={(change) => {
          setView(change.next);
          onViewChange?.(change);
        }}
      />
    );
  }

  render(<StatefulTableView />);

  return new TableViewObject(user);
}
