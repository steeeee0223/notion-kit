import { Icon } from "@notion-kit/icons";
import { LAYOUT_OPTIONS, TableViewMenuPage } from "@notion-kit/table-hook";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  MenuItemSelect,
} from "@notion-kit/ui/primitives";

import { LayoutIcon, MenuHeader } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

import { DeletedPropsMenu } from "./deleted-props-menu";
import { EditGroupMenu } from "./edit-group-menu";
import { EditPropMenu } from "./edit-prop-menu";
import { LayoutMenu } from "./layout-menu";
import { PropsMenu } from "./props-menu";
import { SelectGroupMenu } from "./select-group-menu";
import { SortMenu } from "./sort-menu";
import { TypesMenu } from "./types-menu";

export function TableViewMenu() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        menu: state.menu,
        tableGlobal: state.tableGlobal,
        grouping: state.grouping,
        groupingState: state.groupingState,
        columnsInfo: state.columnsInfo,
      })}
    >
      {() => <TableViewMenuContent />}
    </table.Subscribe>
  );
}

function TableViewMenuContent() {
  const { table } = useTableViewCtx();
  const menu = table.getTableMenuState();

  switch (menu.page) {
    case TableViewMenuPage.Layout:
      return <LayoutMenu />;
    case TableViewMenuPage.Sort:
      return (
        <>
          <MenuHeader
            id="sort"
            title="Sort"
            onBack={() => table.setTableMenuState({ open: true, page: null })}
          />
          <SortMenu />
        </>
      );
    case TableViewMenuPage.Props:
      return <PropsMenu />;
    case TableViewMenuPage.EditProp:
      if (!menu.id) return null as never;
      return <EditPropMenu propId={menu.id} />;
    case TableViewMenuPage.CreateProp:
    case TableViewMenuPage.ChangePropType:
      return (
        <TypesMenu
          propId={menu.id}
          menu={menu.page}
          back
          at={
            menu.data?.at as { id: string; side: "left" | "right" } | undefined
          }
        />
      );
    case TableViewMenuPage.DeletedProps:
      return <DeletedPropsMenu />;
    case TableViewMenuPage.SelectGroupBy:
      return <SelectGroupMenu />;
    case TableViewMenuPage.EditGroupBy:
      return <EditGroupMenu />;
    default:
      return <TableMenu />;
  }
}

function TableMenu() {
  const { table } = useTableViewCtx();
  const { locked, layout } = table.getTableGlobalState();
  const groupedColumn = table.getGroupedColumnInfo();
  const openMenu = (page: TableViewMenuPage) =>
    table.setTableMenuState({ open: true, page });

  return (
    <>
      <MenuHeader id="view-settings" title="View Settings" />
      <DropdownMenuGroup>
        <DropdownMenuItem
          closeOnClick={false}
          icon={<LayoutIcon layout={layout} />}
          label="Layout"
          onClick={() => openMenu(TableViewMenuPage.Layout)}
        >
          <MenuItemSelect>
            {LAYOUT_OPTIONS.find((l) => l.value === layout)?.label}
          </MenuItemSelect>
        </DropdownMenuItem>
        <DropdownMenuItem
          closeOnClick={false}
          icon={<Icon.ArrowUpDown />}
          label="Sort"
          onClick={() => openMenu(TableViewMenuPage.Sort)}
        >
          <MenuItemSelect />
        </DropdownMenuItem>
        <DropdownMenuItem
          closeOnClick={false}
          icon={<Icon.SquareGridBelowLines />}
          label="Group"
          onClick={() =>
            openMenu(
              groupedColumn
                ? TableViewMenuPage.EditGroupBy
                : TableViewMenuPage.SelectGroupBy,
            )
          }
        >
          <MenuItemSelect>{groupedColumn?.name ?? ""}</MenuItemSelect>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel title="Data source settings" />
        <DropdownMenuItem
          closeOnClick={false}
          icon={<Icon.Sliders />}
          label="Edit properties"
          disabled={locked}
          onClick={() => openMenu(TableViewMenuPage.Props)}
        >
          <MenuItemSelect />
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          closeOnClick={false}
          {...(locked
            ? { icon: <Icon.LockOpen />, label: "Unlock database" }
            : { icon: <Icon.Lock />, label: "Lock database" })}
          onClick={table.toggleTableLocked}
        />
      </DropdownMenuGroup>
    </>
  );
}
