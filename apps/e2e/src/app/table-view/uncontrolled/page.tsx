"use client";

import { TableView } from "@notion-kit/table-view";

import { TableViewStateDiagnostic } from "../_components/table-view-state-diagnostic";
import { createTableViewFixture } from "../../../test-fixtures/table-view";

export default function UncontrolledTableViewPage() {
  const initial = createTableViewFixture();

  return (
    <main className="min-h-screen overflow-auto bg-main py-8">
      <header className="mb-6 px-24">
        <h1 className="text-2xl font-semibold">Uncontrolled table view</h1>
      </header>
      <TableView
        defaultData={initial.data}
        defaultProperties={initial.properties}
        defaultView={initial.view}
        getRowUrl={(rowId) => `/table-view/rows/${rowId}`}
      >
        <TableViewStateDiagnostic />
      </TableView>
    </main>
  );
}
