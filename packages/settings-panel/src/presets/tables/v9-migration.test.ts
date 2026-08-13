import { describe, expect, it } from "vitest";

import { settingsTableFeatures } from "./table-features";

describe("settings-panel table migration", () => {
  it("registers the features required by the shared v9 table", () => {
    expect(settingsTableFeatures).toHaveProperty("columnFilteringFeature");
    expect(settingsTableFeatures).toHaveProperty("columnPinningFeature");
    expect(settingsTableFeatures).toHaveProperty("columnSizingFeature");
    expect(settingsTableFeatures).toHaveProperty("rowSelectionFeature");
    expect(settingsTableFeatures).toHaveProperty("rowSortingFeature");
    expect(settingsTableFeatures).toHaveProperty("filteredRowModel");
    expect(settingsTableFeatures).toHaveProperty("sortedRowModel");
  });
});
