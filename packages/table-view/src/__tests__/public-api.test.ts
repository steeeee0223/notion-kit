import { describe, expect, expectTypeOf, it } from "vitest";

import * as TableViewExports from "@/index";
import * as TableViewMenuExports from "@/menus";
import {
  compareBooleans as hookCompareBooleans,
  compareNumbers as hookCompareNumbers,
  compareStrings as hookCompareStrings,
} from "@notion-kit/table-hook";
import type { CellPlugin as LocalCellPlugin } from "@/plugins";
import type { TableProps as LocalTableProps } from "@/table-contexts";
import type {
  CellPlugin,
  ColumnDefs,
  Row,
  TableGlobalState,
  TableProps,
} from "@/index";

describe("table-view public API", () => {
  it("keeps runtime exports available from @notion-kit/table-view", () => {
    expect(TableViewExports.TableView).toBeTypeOf("function");
    expect(TableViewExports.TableViewWrapper).toBeTypeOf("function");
    expect(TableViewExports.useTableViewCtx).toBeTypeOf("function");
    expect(TableViewExports.DateRangeInput).toBeTypeOf("function");
    expect(TableViewExports.useTableView).toBeTypeOf("function");
    expect(TableViewExports.arrayToEntity).toBeTypeOf("function");
    expect(TableViewExports.compareStrings).toBeTypeOf("function");
    expect(TableViewExports.compareNumbers).toBeTypeOf("function");
    expect(TableViewExports.compareBooleans).toBeTypeOf("function");
    expect(TableViewExports.compareStrings).toBe(hookCompareStrings);
    expect(TableViewExports.compareNumbers).toBe(hookCompareNumbers);
    expect(TableViewExports.compareBooleans).toBe(hookCompareBooleans);
  });

  it("keeps shared model and plugin types importable from table-view", () => {
    expectTypeOf<ColumnDefs>().toBeArray();
    expectTypeOf<Row>().toHaveProperty("properties");
    expectTypeOf<CellPlugin>().toHaveProperty("id");
    expectTypeOf<CellPlugin>().toEqualTypeOf<LocalCellPlugin>();
    expectTypeOf<TableProps>().toEqualTypeOf<LocalTableProps>();
    expectTypeOf<TableGlobalState>().toHaveProperty("layout");
    expectTypeOf<typeof TableViewExports.compareStrings>().toEqualTypeOf<
      typeof hookCompareStrings
    >();
    expectTypeOf<typeof TableViewExports.compareNumbers>().toEqualTypeOf<
      typeof hookCompareNumbers
    >();
    expectTypeOf<typeof TableViewExports.compareBooleans>().toEqualTypeOf<
      typeof hookCompareBooleans
    >();
  });

  it("keeps representative menu exports available from @notion-kit/table-view/menus", () => {
    expect(TableViewMenuExports.TableViewMenu).toBeTypeOf("function");
    expect(TableViewMenuExports.SortMenu).toBeTypeOf("function");
    expect(TableViewMenuExports.DateConfigMenu).toBeTypeOf("function");
  });
});
