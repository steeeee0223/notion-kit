import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

import { defaultTableViewMessages } from "./default-messages";
import { mergeTableViewMessages } from "./messages-context";

mockResizeObserver();

describe("TableViewMessages", () => {
  it("Messages_NoOverride_UsesEnglishDefaultsEverywhere", () => {
    renderTableView();

    expect(screen.getByRole("button", { name: "Filter" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Sort" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Settings" })).toBeVisible();
    expect(screen.getByRole("button", { name: "New" })).toBeVisible();
  });

  it("Messages_PartialToolbarOverride_ReplacesOnlyThatStringAndKeepsOtherDefaults", () => {
    renderTableView({
      messages: { toolbar: { filter: "Filtreren" } },
    });

    expect(screen.getByRole("button", { name: "Filtreren" })).toBeVisible();
    // Sibling toolbar strings are untouched by the partial override.
    expect(screen.getByRole("button", { name: "Sort" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Settings" })).toBeVisible();
  });

  it("Messages_DutchRowViewOverride_RenamesRowPeekLabelsAndKeepsIconLogic", async () => {
    const tableView = renderTableView({
      messages: {
        rowView: {
          modes: {
            side: {
              label: "Zijkant",
              tooltip: "Openen als zijkant",
              desc: "",
            },
          },
        },
      },
    });

    const rowActions = await tableView.openRowActions("Task 1");
    expect(rowActions.option("Openen als zijkant")).toBeVisible();
  });

  it("MergeTableViewMessages_DeepPartial_OnlyReplacesProvidedLeaves", () => {
    const merged = mergeTableViewMessages(defaultTableViewMessages, {
      toolbar: { search: "Zoeken" },
    });

    expect(merged.toolbar.search).toBe("Zoeken");
    expect(merged.toolbar.filter).toBe(defaultTableViewMessages.toolbar.filter);
    expect(merged.editLog).toBe(defaultTableViewMessages.editLog);
  });

  it("MergeTableViewMessages_FunctionLeaf_ReplacesWholesaleNotMerged", () => {
    const customFormatter = (name: string) => `>> ${name}`;
    const merged = mergeTableViewMessages(defaultTableViewMessages, {
      editLog: { renamedTo: customFormatter },
    });

    expect(merged.editLog.renamedTo("Task")).toBe(">> Task");
    expect(merged.editLog.changedToType).toBe(
      defaultTableViewMessages.editLog.changedToType,
    );
  });
});
