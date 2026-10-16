import { lazy } from "react";

export const TableViewMenuExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.TableViewMenuExample,
  })),
);
export const SortMenuExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.SortMenuExample,
  })),
);
export const FilterMenuExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.FilterMenuExample,
  })),
);
export const CalcMenuExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.CalcMenuExample,
  })),
);
export const PropMenuExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.PropMenuExample,
  })),
);
export const TypesMenuExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.TypesMenuExample,
  })),
);
export const EditPropMenuExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.EditPropMenuExample,
  })),
);
export const ColumnConfigMenusExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.ColumnConfigMenusExample,
  })),
);
export const RowActionMenuExample = lazy(() =>
  import("./table-menus.examples").then((module) => ({
    default: module.RowActionMenuExample,
  })),
);
