import { Icon } from "@notion-kit/icons";
import {
  MenuGroup,
  MenuItem,
  MenuItemSelect,
  Separator,
} from "@notion-kit/shadcn";

import { MenuGroupHeader, MenuHeader } from "../common";
import { TableViewMenuPage } from "../features";
import { useTableViewCtx } from "../table-contexts";
import { DeletedPropsMenu } from "./deleted-props-menu";
import { EditPropMenu } from "./edit-prop-menu";
import { PropsMenu } from "./props-menu";
import { SortMenu } from "./sort-menu";
import { TypesMenu } from "./types-menu";

export function TableViewMenu() {
  const { table } = useTableViewCtx();
  const menu = table.getTableMenuState();

  switch (menu.page) {
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
    default:
      return (
        <>
          <MenuHeader title="View Settings" />
          <MenuGroup>
            <MenuItem
              Icon={<Icon.ArrowUpDown />}
              Body="Sort"
              onClick={() =>
                table.setTableMenuState({
                  open: true,
                  page: TableViewMenuPage.Sort,
                })
              }
            >
              <MenuItemSelect />
            </MenuItem>
          </MenuGroup>
          <Separator />
          <MenuGroup>
            <MenuGroupHeader title="Data source settings" />
            <MenuItem
              Icon={<Icon.Sliders />}
              Body="Edit properties"
              onClick={() =>
                table.setTableMenuState({
                  open: true,
                  page: TableViewMenuPage.Props,
                })
              }
            >
              <MenuItemSelect />
            </MenuItem>
          </MenuGroup>
        </>
      );
  }
}
