import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CountMethod,
  type DataResourceAction,
  type PropertiesResourceAction,
  type Row,
  type TableViewState,
  type ViewResourceAction,
} from "@notion-kit/table-hook";

import { useTableViewCtx } from "../../table-contexts/table-view-provider";
import {
  createFullPluginFixture,
  createResourceProbe,
  mockResizeObserver,
} from "../mock";
import { renderTableView, type TableViewProps } from "./render-table-view";

type PropertiesChange = Parameters<
  NonNullable<TableViewProps["onPropertiesChange"]>
>[0];

mockResizeObserver();

function ResourceUpdateControls() {
  const { table } = useTableViewCtx();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          table.setTableData(
            (rows) =>
              rows.map((row) =>
                row.id === "row-alpha"
                  ? {
                      ...row,
                      properties: {
                        ...row.properties,
                        notes: {
                          ...row.properties.notes!,
                          value: "updated note",
                        },
                      },
                    }
                  : row,
              ),
            {
              id: "harness-data-update",
              type: "data.cell.update",
              payload: {
                rowId: "row-alpha",
                propertyId: "notes",
                nextValue: "updated note",
              },
            },
          )
        }
      >
        Update Alpha notes
      </button>
      <button
        type="button"
        onClick={() => table.setColumnInfo("notes", { name: "Details" })}
      >
        Rename notes property
      </button>
      <button
        type="button"
        onClick={() => table.setColumnCountMethod("notes", CountMethod.VALUES)}
      >
        Count note values
      </button>
      <button type="button" onClick={() => table.setGroupingColumn("status")}>
        Group by status
      </button>
      <button type="button" onClick={() => table.setTableLayout("list")}>
        Switch to list layout
      </button>
    </>
  );
}

describe("TableViewHarness", () => {
  it("TableViewHarness_FullPluginRowsAndGroups_ReturnsSemanticOrderAndNamedGroup", async () => {
    // Arrange
    const fixture = createFullPluginFixture();
    const tableView = renderTableView({
      ...fixture,
      children: <ResourceUpdateControls />,
    });

    // Act
    await tableView.clickButton("Group by status");
    await tableView.expandGroup("status:Active");
    await tableView.expandGroup("status:null");
    await tableView.expandGroup("status:Done");

    // Assert
    expect(tableView.rowOrder(["Alpha", "Empty", "Omega"])).toEqual([
      "Alpha",
      "Empty",
      "Omega",
    ]);
    expect(tableView.group("status:Active")).toBeVisible();
  });

  it("TableViewHarness_FooterCalculation_ReturnsVisibleResult", async () => {
    // Arrange
    const fixture = createFullPluginFixture();
    const tableView = renderTableView({
      ...fixture,
      children: <ResourceUpdateControls />,
    });

    // Act
    await tableView.clickButton("Count note values");

    // Assert
    await waitFor(() => {
      expect(tableView.footerResult("Notes")).toHaveTextContent("values2");
    });
  });

  it("TableViewHarness_ControlledResources_ApplyNextAndExposeTypedChanges", async () => {
    // Arrange
    const fixture = createFullPluginFixture();
    const dataProbe = createResourceProbe<Row[], DataResourceAction>();
    const propertiesProbe = createResourceProbe<
      PropertiesChange["next"],
      PropertiesResourceAction
    >();
    const viewProbe = createResourceProbe<TableViewState, ViewResourceAction>();
    const tableView = renderTableView({
      ...fixture,
      onDataChange: dataProbe.onChange,
      onPropertiesChange: propertiesProbe.onChange,
      onViewChange: viewProbe.onChange,
      children: <ResourceUpdateControls />,
    });

    // Act
    await tableView.clickButton("Update Alpha notes");

    await waitFor(() => {
      expect(tableView.row("Alpha")).toHaveTextContent("updated note");
      expect(dataProbe.lastChange().next[0]?.properties.notes?.value).toBe(
        "updated note",
      );
    });

    await tableView.clickButton("Rename notes property");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Details" })).toBeVisible();
      expect(propertiesProbe.lastChange().next).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "notes", name: "Details" }),
        ]),
      );
    });

    await tableView.clickButton("Switch to list layout");

    // Assert
    await waitFor(() => {
      expect(viewProbe.lastChange().next).toMatchObject({ layout: "list" });
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });
});
