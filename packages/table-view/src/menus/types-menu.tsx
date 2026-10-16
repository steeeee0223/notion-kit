import { v4 } from "uuid";

import { TableViewMenuPage } from "@notion-kit/table-hook";
import type { PluginType } from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuGroup,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  MenuItemCheck,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, MenuHeader } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

interface TypesMenuOptions {
  /**
   * @prop if undefined, will create a new column at the end;
   * otherwise will create a column at `at.side` of the column `at.id`
   */
  at?: {
    id: string;
    side: "left" | "right";
  };
  /**
   * @prop control the menu page
   */
  menu: TableViewMenuPage.CreateProp | TableViewMenuPage.ChangePropType | null;
  /**
   * @prop whether to show back button in the header
   */
  back?: boolean;
  /** Keep false for shared editor page navigation; use true for popup handoffs. */
  closeOnClick: boolean;
}

type TypesMenuProps = TypesMenuOptions &
  ({ propId: string; query?: never } | { propId?: undefined; query: string });

export function TypesMenu({
  propId,
  at,
  menu,
  back,
  query: search = "",
  closeOnClick,
}: TypesMenuProps) {
  const { table, plugins: registry } = useTableViewCtx();
  const propType = propId ? table.getColumnInfo(propId).type : null;

  const select = (
    type: PluginType<CellPlugin[]>,
    name: string,
    width?: number,
  ) => {
    let colId = propId;
    if (colId === undefined) {
      colId = v4();
      const uniqueName = table.generateUniqueColumnName(name);
      table.addColumnInfo({
        id: colId,
        type,
        name: uniqueName,
        width: width?.toString(),
        at,
      });
    } else {
      table.setColumnType(colId, type);
    }
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.EditProp,
      id: colId,
    });
  };

  return (
    <>
      {menu && (
        <MenuHeader
          title={
            menu === TableViewMenuPage.ChangePropType
              ? "Change property type"
              : "New property"
          }
          onBack={
            back
              ? () =>
                  table.setTableMenuState({
                    open: true,
                    page:
                      menu === TableViewMenuPage.ChangePropType
                        ? TableViewMenuPage.EditProp
                        : TableViewMenuPage.Props,
                    id: propId,
                  })
              : undefined
          }
        />
      )}
      <table.Subscribe selector={(state) => state.cellPlugins}>
        {(plugins) => (
          <>
            <DropdownMenuInput
              placeholder={
                propId
                  ? "Search for property type"
                  : "Search or add new property"
              }
              aria-label="Search property types"
            />

            <DropdownMenuList>
              <DropdownMenuGroup>
                <DropdownMenuLabel title="Type" />
                {Object.values(plugins).map((entry) => {
                  const plugin = registry.getUiPlugin(entry.id);
                  return (
                    <TooltipPreset
                      key={plugin.id}
                      side="left"
                      sideOffset={6}
                      description={plugin.meta.desc}
                      className="max-w-[282px] text-xs/[1.4]"
                    >
                      <DropdownMenuItem
                        closeOnClick={closeOnClick}
                        disabled={plugin.id === "title"}
                        icon={plugin.meta.icon}
                        label={plugin.meta.name}
                        onClick={() =>
                          select(
                            plugin.id,
                            plugin.default.name,
                            plugin.default.width,
                          )
                        }
                      >
                        {propType === plugin.id && <MenuItemCheck />}
                      </DropdownMenuItem>
                    </TooltipPreset>
                  );
                })}
              </DropdownMenuGroup>
              {!propId && search.length > 0 && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel title="Select to add" />
                  <DropdownMenuItem
                    closeOnClick={closeOnClick}
                    icon={
                      <DefaultIcon type="text" className="fill-menu-icon" />
                    }
                    label={search}
                    onClick={() => select("text", search)}
                  />
                </DropdownMenuGroup>
              )}
            </DropdownMenuList>
          </>
        )}
      </table.Subscribe>
    </>
  );
}
