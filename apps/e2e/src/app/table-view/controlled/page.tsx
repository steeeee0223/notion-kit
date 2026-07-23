"use client";

import { useState } from "react";

import {
  TableView,
  type DataResourceAction,
  type PropertiesResourceAction,
  type ViewResourceAction,
} from "@notion-kit/table-view";

import { TableViewStateDiagnostic } from "../_components/table-view-state-diagnostic";
import { createTableViewFixture } from "../../../test-fixtures/table-view";

export default function ControlledTableViewPage() {
  const initial = createTableViewFixture();
  const [data, setData] = useState(initial.data);
  const [properties, setProperties] = useState(initial.properties);
  const [view, setView] = useState(initial.view);
  const [dataCount, setDataCount] = useState(0);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [lastDataAction, setLastDataAction] =
    useState<DataResourceAction | null>(null);
  const [lastPropertiesAction, setLastPropertiesAction] =
    useState<PropertiesResourceAction | null>(null);
  const [lastViewAction, setLastViewAction] =
    useState<ViewResourceAction | null>(null);

  const reset = () => {
    const next = createTableViewFixture();
    setData(next.data);
    setProperties(next.properties);
    setView(next.view);
    setDataCount(0);
    setPropertiesCount(0);
    setViewCount(0);
    setLastDataAction(null);
    setLastPropertiesAction(null);
    setLastViewAction(null);
  };

  return (
    <main className="min-h-screen overflow-auto bg-main py-8">
      <header className="mb-6 px-24">
        <h1 className="text-2xl font-semibold">Controlled table view</h1>
        <button type="button" onClick={reset}>
          Reset controlled state
        </button>
      </header>
      <TableView
        data={data}
        properties={properties}
        view={view}
        getRowUrl={(rowId) => `/table-view/rows/${rowId}`}
        onDataChange={(change) => {
          setData(change.next);
          setDataCount((count) => count + 1);
          setLastDataAction(change.action);
        }}
        onPropertiesChange={(change) => {
          setProperties(change.next);
          setPropertiesCount((count) => count + 1);
          setLastPropertiesAction(change.action);
        }}
        onViewChange={(change) => {
          setView(change.next);
          setViewCount((count) => count + 1);
          setLastViewAction(change.action);
        }}
      >
        <TableViewStateDiagnostic />
      </TableView>
      <section aria-label="Controlled parent state" className="px-24 pt-8">
        <pre data-testid="controlled-state">
          {JSON.stringify({
            dataCount,
            propertiesCount,
            viewCount,
            lastDataAction,
            lastPropertiesAction,
            lastViewAction,
            data,
            properties,
            view,
          })}
        </pre>
      </section>
    </main>
  );
}
