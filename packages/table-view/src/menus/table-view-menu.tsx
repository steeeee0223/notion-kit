import { Icon } from "@notion-kit/icons";
import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  Separator,
} from "@notion-kit/shadcn";

import { MenuGroupHeader, MenuHeader } from "../common";
import { TableViewMenuPage } from "../lib/utils";
import { useTableViewCtx } from "../table-contexts";
import { DeletedPropsMenu } from "./deleted-props-menu";
import { EditPropMenu } from "./edit-prop-menu";
import { PropsMenu } from "./props-menu";
import { SortMenu } from "./sort-menu";
import { TypesMenu } from "./types-menu";

export function TableViewMenu() {
  const { menu, setTableMenu } = useTableViewCtx();

  switch (menu.page) {
    case TableViewMenuPage.Sort:
      return (
        <>
          <MenuHeader
            title="Sort"
            onBack={() => setTableMenu({ open: true, page: null })}
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
      return <TypesMenu propId={menu.id} menu={menu.page} back />;
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
                setTableMenu({ open: true, page: TableViewMenuPage.Sort })
              }
            >
              <MenuItemAction className="flex items-center">
                <Icon.ChevronRight className="h-full w-3 fill-icon" />
              </MenuItemAction>
            </MenuItem>
          </MenuGroup>
          <Separator />
          <MenuGroup>
            <MenuGroupHeader title="Data source settings" />
            <MenuItem
              Icon={<Icon.Sliders />}
              Body="Edit properties"
              onClick={() =>
                setTableMenu({ open: true, page: TableViewMenuPage.Props })
              }
            >
              <MenuItemAction className="flex items-center">
                <Icon.ChevronRight className="h-full w-3 fill-icon" />
              </MenuItemAction>
            </MenuItem>
          </MenuGroup>
        </>
      );
  }
}
