import { Icon } from "@notion-kit/icons";
import {
  countFilterRules,
  LAYOUT_OPTIONS,
  TableViewMenuPage,
} from "@notion-kit/table-hook";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  MenuItemSelect,
} from "@notion-kit/ui/primitives";

import { LayoutIcon, MenuHeader } from "@/common";
import { useEditLog } from "@/edit-log/edit-log-provider";
import { useTableViewMessages } from "@/messages";
import {
  FILTER_MENU_TOOLBAR_TRIGGER_ID,
  useMenuCoordinator,
  useTableViewCtx,
} from "@/table-contexts";

import { DeletedPropsMenu } from "./deleted-props-menu";
import { EditGroupMenu } from "./edit-group-menu";
import { EditPropMenu } from "./edit-prop-menu";
import { LayoutMenu } from "./layout-menu";
import { PropsMenu } from "./props-menu";
import { SelectGroupMenu } from "./select-group-menu";
import { SortMenu } from "./sort-menu";
import { TypesMenu } from "./types-menu";

interface TableViewMenuProps {
  getReturnFocus?: () => HTMLElement | null;
}

export function TableViewMenu(props: TableViewMenuProps) {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        menu: state.menu,
        sorting: state.sorting,
        tableGlobal: state.tableGlobal,
        grouping: state.grouping,
        groupingState: state.groupingState,
        columnsInfo: state.columnsInfo,
      })}
    >
      {() => <TableViewMenuContent {...props} />}
    </table.Subscribe>
  );
}

function TableViewMenuContent(props: TableViewMenuProps) {
  const { table } = useTableViewCtx();
  const messages = useTableViewMessages();
  const menu = table.getTableMenuState();

  switch (menu.page) {
    case TableViewMenuPage.Layout:
      return <LayoutMenu />;
    case TableViewMenuPage.Sort:
      return (
        <>
          <MenuHeader
            id="sort"
            title={messages.viewMenu.sort}
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
      return <TableMenu {...props} />;
  }
}

function TableMenu({ getReturnFocus }: TableViewMenuProps) {
  const { filterMenu } = useMenuCoordinator();
  const { canViewTableLogs, openTableLog } = useEditLog();

  const { table, readOnly } = useTableViewCtx();
  const messages = useTableViewMessages();
  const { locked, layout } = table.getTableGlobalState();
  const groupedColumn = table.getGroupedColumnInfo();
  const filterCount = countFilterRules(table.getFilters());
  const sortingCount = table.atoms.sorting.get().length;
  const openMenu = (page: TableViewMenuPage) =>
    table.setTableMenuState({ open: true, page });

  return (
    <>
      <MenuHeader id="view-settings" title={messages.viewMenu.viewSettings} />
      <DropdownMenuGroup>
        <DropdownMenuItem
          closeOnClick={false}
          icon={<LayoutIcon layout={layout} />}
          label={messages.viewMenu.layout}
          onClick={() => openMenu(TableViewMenuPage.Layout)}
        >
          <MenuItemSelect>
            {messages.layoutMenu.layouts[layout] ??
              LAYOUT_OPTIONS.find((l) => l.value === layout)?.label}
          </MenuItemSelect>
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={<Icon.FilterSmall />}
          label={messages.viewMenu.filter}
          onClick={() => filterMenu.handle.open(FILTER_MENU_TOOLBAR_TRIGGER_ID)}
        >
          <MenuItemSelect>{filterCount || ""}</MenuItemSelect>
        </DropdownMenuItem>
        <DropdownMenuItem
          closeOnClick={false}
          icon={<Icon.ArrowUpDown />}
          label={messages.viewMenu.sort}
          onClick={() => openMenu(TableViewMenuPage.Sort)}
        >
          <MenuItemSelect>{sortingCount || ""}</MenuItemSelect>
        </DropdownMenuItem>
        <DropdownMenuItem
          closeOnClick={false}
          icon={<Icon.SquareGridBelowLines />}
          label={messages.viewMenu.group}
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
        <DropdownMenuLabel title={messages.viewMenu.dataSourceSettings} />
        <DropdownMenuItem
          closeOnClick={false}
          icon={<Icon.Sliders />}
          label={messages.viewMenu.editProperties}
          disabled={locked}
          onClick={() => openMenu(TableViewMenuPage.Props)}
        >
          <MenuItemSelect />
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {!readOnly.locked && (
          <DropdownMenuItem
            closeOnClick={false}
            {...(locked
              ? {
                  icon: <Icon.LockOpen />,
                  label: messages.viewMenu.unlockDatabase,
                }
              : { icon: <Icon.Lock />, label: messages.viewMenu.lockDatabase })}
            onClick={table.toggleTableLocked}
          />
        )}
        {canViewTableLogs && (
          <DropdownMenuItem
            icon={<Icon.Clock />}
            label={messages.viewMenu.editLog}
            onClick={() => {
              const returnFocus = getReturnFocus?.();
              table.setTableMenuState({ open: false, page: null });
              openTableLog(returnFocus);
            }}
          />
        )}
      </DropdownMenuGroup>
    </>
  );
}
