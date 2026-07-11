import { describe, expect, it } from "vitest";

import * as TableHookExports from "@/index";

describe("table-hook public API", () => {
  it("exports the v9 table engine contract used by table-view", () => {
    expect(TableHookExports.useTableView).toBeTypeOf("function");
    expect(TableHookExports.arrayToEntity).toBeTypeOf("function");
    expect(TableHookExports.wrappedClassName).toBeTypeOf("function");
    expect(TableHookExports.CountMethod).toBeDefined();
    expect(TableHookExports.TableViewMenuPage).toBeDefined();
  });
});
