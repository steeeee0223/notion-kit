import { useState } from "react";
import { v4 } from "uuid";

import { TableViewMenuPage } from "@notion-kit/table-hook";
import type { PluginType } from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  MenuItemCheck,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, MenuHeader } from "@/common";
import { useTableViewMessages } from "@/messages";
import type { TableUiPlugin } from "@/plugins";
import { useTableViewCtx } from "@/table-contexts";

interface TypesMenuProps {
  /**
   * @prop if null, will create a new column;
   * otherwise will update a column by given `propId`
   */
  propId?: string;
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
}

export function TypesMenu({ propId, at, menu, back }: TypesMenuProps) {
  const { table, plugins: registry } = useTableViewCtx();
  const messages = useTableViewMessages();
  const propType = propId ? table.getColumnInfo(propId).type : null;
  const [search, setSearch] = useState("");

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
              ? messages.typesMenu.changePropertyType
              : messages.typesMenu.newProperty
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
          <Autocomplete<TableUiPlugin>
            items={Object.values(plugins).map((plugin) =>
              registry.getUiPlugin(plugin.id),
            )}
            itemToStringValue={(plugin) => plugin.default.name}
            value={search}
            onValueChange={setSearch}
            open
            autoHighlight="always"
            openOnInputClick
          >
            <AutocompleteInput
              placeholder={
                propId
                  ? messages.typesMenu.searchPropertyType
                  : messages.typesMenu.searchOrAddNewProperty
              }
              onKeyDown={(e) => e.stopPropagation()}
            />
            <AutocompleteContent variant="inline">
              <AutocompleteList>
                <AutocompleteGroup>
                  <AutocompleteLabel title={messages.typesMenu.typeTitle} />
                  <AutocompleteCollection>
                    {(plugin: TableUiPlugin) => (
                      <TooltipPreset
                        key={plugin.id}
                        side="left"
                        sideOffset={6}
                        description={plugin.meta.desc}
                        className="max-w-[282px] text-xs/[1.4]"
                      >
                        <AutocompleteItem
                          value={plugin}
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
                        </AutocompleteItem>
                      </TooltipPreset>
                    )}
                  </AutocompleteCollection>
                </AutocompleteGroup>
                {!propId && search.length > 0 && (
                  <AutocompleteGroup>
                    <AutocompleteLabel title={messages.typesMenu.selectToAdd} />
                    <AutocompleteItem
                      value={`search-${search}`}
                      icon={
                        <DefaultIcon type="text" className="fill-menu-icon" />
                      }
                      label={search}
                      onClick={() => select("text", search)}
                    />
                  </AutocompleteGroup>
                )}
              </AutocompleteList>
            </AutocompleteContent>
          </Autocomplete>
        )}
      </table.Subscribe>
    </>
  );
}
