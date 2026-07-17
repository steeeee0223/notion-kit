import { describe, expect, it } from "vitest";

import type { ColumnInfo, Row } from "@notion-kit/table-hook";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

mockResizeObserver();

const propertiesWithDeleted: ColumnInfo[] = [
  { id: "col1", name: "Title", type: "text", width: "200", config: {} },
  { id: "col2", name: "Status", type: "checkbox", width: "100", config: {} },
  {
    id: "col3",
    name: "Archived Property",
    type: "text",
    width: "150",
    config: {},
    isDeleted: true,
  },
  {
    id: "col4",
    name: "Old Property",
    type: "checkbox",
    width: "100",
    config: {},
    isDeleted: true,
  },
];

const dataWithDeleted: Row[] = [
  {
    id: "row1",
    createdAt: Date.now(),
    lastEditedAt: Date.now(),
    properties: {
      col1: { id: "cell1", value: "Task 1" },
      col2: { id: "cell2", value: true },
      col3: { id: "cell3", value: "archived" },
      col4: { id: "cell4", value: false },
    },
  },
];

async function openPropertiesMenu() {
  const tableView = renderTableView({
    properties: propertiesWithDeleted,
    data: dataWithDeleted,
  });
  const settings = await tableView.openViewSettings();
  return settings.openProperties();
}

async function openDeletedPropertiesMenu() {
  const properties = await openPropertiesMenu();
  return properties.openDeletedProperties();
}

describe("DeletedPropsMenu", () => {
  it("PropertiesMenu_DeletedProperties_ShowsCount", async () => {
    const properties = await openPropertiesMenu();

    expect(properties.deletedPropertiesItem()).toBeVisible();
    expect(properties.deletedCount(2)).toBeVisible();
  });

  it("DeletedPropertiesMenu_Open_ShowsDeletedProperties", async () => {
    const deleted = await openDeletedPropertiesMenu();

    expect(deleted.property("Archived Property")).toBeVisible();
    expect(deleted.property("Old Property")).toBeVisible();
  });

  it("DeletedPropertiesMenu_Open_ShowsNamedRestoreActions", async () => {
    const deleted = await openDeletedPropertiesMenu();

    expect(deleted.restoreButton("Archived Property")).toBeVisible();
    expect(deleted.restoreButton("Old Property")).toBeVisible();
  });

  it("DeletedPropertiesMenu_Open_ShowsNamedDeleteActions", async () => {
    const deleted = await openDeletedPropertiesMenu();

    expect(deleted.deleteButton("Archived Property")).toBeVisible();
    expect(deleted.deleteButton("Old Property")).toBeVisible();
  });

  it("DeletedPropertiesMenu_Restore_RemovesPropertyFromDeletedList", async () => {
    const deleted = await openDeletedPropertiesMenu();

    await deleted.restore("Archived Property");

    expect(deleted.queryProperty("Archived Property")).not.toBeInTheDocument();
    expect(deleted.restoreButton("Old Property")).toBeVisible();
  });

  it("DeletedPropertiesMenu_Delete_RemovesPropertyPermanently", async () => {
    const deleted = await openDeletedPropertiesMenu();

    await deleted.delete("Archived Property");

    expect(deleted.queryProperty("Archived Property")).not.toBeInTheDocument();
  });

  it("DeletedPropertiesMenu_BackNavigation_ReturnsToProperties", async () => {
    const deleted = await openDeletedPropertiesMenu();

    const properties = await deleted.backToProperties();

    expect(properties.heading()).toBeVisible();
  });
});
