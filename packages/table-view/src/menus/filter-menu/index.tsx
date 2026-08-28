import { Icon } from "@notion-kit/icons";
import { MenuGroup, MenuItem, Separator } from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { AddFilterMenu } from "./add-filter-menu";
import { FilterGroupEditor } from "./filter-group-editor";

export function FilterMenu() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        filters: state.tableGlobal.filters,
        columnsInfo: state.columnsInfo,
        cellPlugins: state.cellPlugins,
      })}
    >
      {({ filters }) => {
        const validFilters = table.validateFilters(filters) ? filters : null;

        return (
          <section aria-label="Filters">
            {validFilters ? (
              <>
                <FilterGroupEditor
                  group={validFilters}
                  root={validFilters}
                  depth={1}
                  testId={`filter-group-${validFilters.id}`}
                />
                <Separator />
                <MenuGroup>
                  {/* Delete action */}
                  <MenuItem
                    icon={<Icon.Trash />}
                    label="Delete filter"
                    variant="warning"
                    onClick={() => table.clearFilters()}
                  />
                </MenuGroup>
              </>
            ) : (
              <MenuGroup>
                <AddFilterMenu />
              </MenuGroup>
            )}
          </section>
        );
      }}
    </table.Subscribe>
  );
}
