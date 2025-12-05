import { Icon } from "@notion-kit/icons";
import {
  MenuGroup,
  MenuItem,
  MenuItemSelect,
  Separator,
} from "@notion-kit/shadcn";

import { LayoutIcon, MenuGroupHeader, MenuHeader } from "../common";
import { LAYOUT_OPTIONS, TableViewMenuPage } from "../features";
import { useTableViewCtx } from "../table-contexts";
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
  const menu = table.getTableMenuState();

  switch (menu.page) {
    case TableViewMenuPage.Layout:
      return <LayoutMenu />;
    case TableViewMenuPage.Sort:
      return (
        <>
          <MenuHeader
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
      <MenuHeader title="View Settings" />
      <MenuGroup>
        <MenuItem
          Icon={<LayoutIcon layout={layout} />}
          Body="Layout"
          onClick={() => openMenu(TableViewMenuPage.Layout)}
        >
          <MenuItemSelect>
            {LAYOUT_OPTIONS.find((l) => l.value === layout)?.label}
          </MenuItemSelect>
        </MenuItem>
        <MenuItem
          Icon={<Icon.ArrowUpDown />}
          Body="Sort"
          onClick={() => openMenu(TableViewMenuPage.Sort)}
        >
          <MenuItemSelect />
        </MenuItem>
        <MenuItem
          Icon={<Icon.SquareGridBelowLines />}
          Body="Group"
          onClick={() =>
            openMenu(
              groupedColumn
                ? TableViewMenuPage.EditGroupBy
                : TableViewMenuPage.SelectGroupBy,
            )
          }
        >
          <MenuItemSelect>{groupedColumn?.name ?? ""}</MenuItemSelect>
        </MenuItem>
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuGroupHeader title="Data source settings" />
        <MenuItem
          Icon={<Icon.Sliders />}
          Body="Edit properties"
          disabled={locked}
          onClick={() => openMenu(TableViewMenuPage.Props)}
        >
          <MenuItemSelect />
        </MenuItem>
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem
          {...(locked
            ? { Icon: <Icon.LockOpen />, Body: "Unlock database" }
            : { Icon: <Icon.Lock />, Body: "Lock database" })}
          onClick={table.toggleTableLocked}
        />
      </MenuGroup>
    </>
  );
}
