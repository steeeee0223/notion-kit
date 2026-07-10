import { describe, expect, it } from "vitest";

import {
  ColumnsInfoFeature,
  DEFAULT_FEATURES,
  ExtendedGroupingFeature,
  getExtendedGroupedRowModel,
} from "../index";

describe("public API", () => {
  it("exports composable table features and row model factories", () => {
    expect(DEFAULT_FEATURES.columnsInfoFeature).toBe(ColumnsInfoFeature);
    expect(DEFAULT_FEATURES.extendedGroupingFeature).toBe(
      ExtendedGroupingFeature,
    );
    expect(getExtendedGroupedRowModel).toEqual(expect.any(Function));
  });
});
