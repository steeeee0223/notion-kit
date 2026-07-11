import { describe, expect, expectTypeOf, it } from "vitest";

import * as TableViewExports from "@/index";
import * as TableViewMenuExports from "@/menus";
import type { CellPlugin, ColumnDefs, Row } from "@/index";

describe("table-view public API", () => {
  it("keeps runtime exports available from @notion-kit/table-view", () => {
    expect(TableViewExports.TableView).toBeTypeOf("function");
    expect(TableViewExports.TableViewWrapper).toBeTypeOf("function");
    expect(TableViewExports.DateRangeInput).toBeTypeOf("function");
  });

  it("keeps shared model and plugin types importable from table-view", () => {
    expectTypeOf<ColumnDefs>().toBeArray();
    expectTypeOf<Row>().toHaveProperty("properties");
    expectTypeOf<CellPlugin>().toHaveProperty("id");
  });

  it("keeps representative menu exports available from @notion-kit/table-view/menus", () => {
    expect(TableViewMenuExports.TableViewMenu).toBeTypeOf("function");
    expect(TableViewMenuExports.SortMenu).toBeTypeOf("function");
    expect(TableViewMenuExports.DateConfigMenu).toBeTypeOf("function");
  });
});
