import { defineStory } from "@/lib/story";

import {
  CalcMenuExample,
  ColumnConfigMenusExample,
  EditPropMenuExample,
  FilterMenuExample,
  PropMenuExample,
  RowActionMenuExample,
  SortMenuExample,
  TableViewMenuExample,
  TypesMenuExample,
} from "./table-menus.lazy";

export const TableViewMenu = defineStory({
  Component: TableViewMenuExample,
  displayName: "Table View Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/TableViewMenu",
    width: 1280,
    height: 800,
  },
});
export const SortMenu = defineStory({
  Component: SortMenuExample,
  displayName: "Sort Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/SortMenu",
    width: 1280,
    height: 800,
  },
});
export const FilterMenu = defineStory({
  Component: FilterMenuExample,
  displayName: "Filter Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/FilterMenu",
    width: 1280,
    height: 800,
  },
});
export const CalcMenu = defineStory({
  Component: CalcMenuExample,
  displayName: "Calc Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/CalcMenu",
    width: 1280,
    height: 800,
  },
});
export const PropMenu = defineStory({
  Component: PropMenuExample,
  displayName: "Prop Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/PropMenu",
    width: 1280,
    height: 800,
  },
});
export const TypesMenu = defineStory({
  Component: TypesMenuExample,
  displayName: "Types Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/TypesMenu",
    width: 1280,
    height: 800,
  },
});
export const EditPropMenu = defineStory({
  Component: EditPropMenuExample,
  displayName: "Edit Prop Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/EditPropMenu",
    width: 1280,
    height: 800,
  },
});
export const ColumnConfigMenus = defineStory({
  Component: ColumnConfigMenusExample,
  displayName: "Column Config Menus",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/ColumnConfigMenus",
    width: 1280,
    height: 800,
  },
});
export const RowActionMenu = defineStory({
  Component: RowActionMenuExample,
  displayName: "Row Action Menu",
  args: { initial: {} },
  frame: {
    src: "/story/development/collections/table-view/table-menus/RowActionMenu",
    width: 1280,
    height: 800,
  },
});
