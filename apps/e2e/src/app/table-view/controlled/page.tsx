"use client";

import { useEffect, useState } from "react";

import {
  TableView,
  type DataResourceAction,
  type PropertiesResourceAction,
  type ViewResourceAction,
} from "@notion-kit/table-view";
import { createMockEditLogApi } from "@notion-kit/table-view/mock";
import { Button } from "@notion-kit/ui/primitives";

import { TableViewStateDiagnostic } from "../_components/table-view-state-diagnostic";
import { createCalendarTableScenario } from "../../../test-fixtures/calendar";
import {
  createPluginConfigurationScenario,
  createTableViewFixture,
} from "../../../test-fixtures/table-view";

export default function ControlledTableViewPage() {
  const [initial] = useState(createTableViewFixture);
  const [editLogs] = useState(() => createMockEditLogApi(initial));
  const [data, setData] = useState(initial.data);
  const [rejectData, setRejectData] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);
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
    setRejectData(false);
    setDataCount(0);
    setPropertiesCount(0);
    setViewCount(0);
    setLastDataAction(null);
    setLastPropertiesAction(null);
    setLastViewAction(null);
  };

  const applyPluginConfigurationScenario = () => {
    const next = createPluginConfigurationScenario();
    setData(next.data);
    setProperties(next.properties);
  };

  const openLockedAlphaRow = () => {
    setView((current) => ({
      ...current,
      locked: true,
      openedRowId: "row-alpha",
      rowView: "side",
    }));
  };

  return (
    <main className="min-h-screen overflow-auto bg-main py-8">
      <header className="mb-6 px-24">
        <h1 className="text-2xl font-semibold">Controlled table view</h1>
        <button type="button" onClick={reset}>
          Reset controlled state
        </button>
        <button type="button" onClick={applyPluginConfigurationScenario}>
          Apply plugin configuration scenario
        </button>
        <button type="button" onClick={openLockedAlphaRow}>
          Open locked Alpha row
        </button>
        <Button
          onClick={() => {
            const scenario = createCalendarTableScenario();
            setData(scenario.data);
            setProperties(scenario.properties);
            setView(scenario.view);
            setRejectData(false);
          }}
        >
          Apply Calendar scenario
        </Button>
        <Button
          aria-pressed={rejectData}
          onClick={() => setRejectData((current) => !current)}
        >
          Reject data changes
        </Button>
        <Button aria-pressed={dark} onClick={() => setDark((value) => !value)}>
          Dark mode
        </Button>
      </header>
      <TableView
        {...editLogs}
        data={data}
        properties={properties}
        view={view}
        getRowUrl={(rowId) => `/table-view/rows/${rowId}`}
        onDataChange={(change) => {
          if (!rejectData) setData(change.next);
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
