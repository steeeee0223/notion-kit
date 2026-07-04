import { useState } from "react";
import { v4 } from "uuid";

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
import { TableViewMenuPage } from "@/features";
import type { PluginType } from "@/lib/types";
import type { CellPlugin } from "@/plugins";
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
  const { table } = useTableViewCtx();

  const plugins = table.getState().cellPlugins;
  const pluginOptions = Object.values(plugins);
  const propType = propId ? table.getColumnInfo(propId).type : null;
  const [search, setSearch] = useState("");

  const select = (type: PluginType<CellPlugin[]>, name: string) => {
    let colId = propId;
    if (colId === undefined) {
      colId = v4();
      const uniqueName = table.generateUniqueColumnName(name);
      table.addColumnInfo({ id: colId, type, name: uniqueName, at });
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
      <Autocomplete
        items={pluginOptions}
        itemToStringValue={(plugin) => plugin.default.name}
        value={search}
        onValueChange={setSearch}
        open
        autoHighlight="always"
        openOnInputClick
      >
        <AutocompleteInput
          placeholder={
            propId ? "Search for property type" : "Search or add new property"
          }
          onKeyDown={(e) => e.stopPropagation()}
        />
        <AutocompleteContent role="presentation" variant="inline">
          <AutocompleteList>
            <AutocompleteGroup>
              <AutocompleteLabel title="Type" />
              <AutocompleteCollection>
                {(plugin: CellPlugin) => (
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
                      onClick={() => select(plugin.id, plugin.meta.name)}
                    >
                      {propType === plugin.id && <MenuItemCheck />}
                    </AutocompleteItem>
                  </TooltipPreset>
                )}
              </AutocompleteCollection>
            </AutocompleteGroup>
            {!propId && search.length > 0 && (
              <AutocompleteGroup>
                <AutocompleteLabel title="Select to add" />
                <AutocompleteItem
                  value={`search-${search}`}
                  icon={<DefaultIcon type="text" className="fill-menu-icon" />}
                  label={search}
                  onClick={() => select("text", search)}
                />
              </AutocompleteGroup>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </>
  );
}
