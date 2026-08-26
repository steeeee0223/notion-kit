import { useState } from "react";

import {
  appendFilterNode,
  createFilterGroup,
  createFilterRule,
  type TableFilterState,
} from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import {
  FilterGroupEditor,
  PendingPropertyPicker,
} from "./filter-group-editor";
import type { DefaultFilterRule, FilterProperty } from "./types";

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
      {({ filters, cellPlugins }) => (
        <FilterMenuContent filters={filters} plugins={cellPlugins} />
      )}
    </table.Subscribe>
  );
}

function FilterMenuContent({
  filters,
  plugins,
}: {
  filters: unknown;
  plugins: Record<string, CellPlugin>;
}) {
  const { table } = useTableViewCtx();
  const validFilters = table.validateFilters(filters) ? filters : null;
  const properties = table.getFilterProperties();
  const defaultRule = table.getTitleFilterRule();
  const commit = (next: TableFilterState) => {
    if (next === null) table.clearFilters();
    else table.setFilters(next);
  };

  return (
    <section
      aria-label="Filters"
      className="flex w-full min-w-0 flex-col gap-2 p-2"
    >
      {validFilters ? (
        <FilterGroupEditor
          group={validFilters}
          root={validFilters}
          depth={1}
          properties={properties}
          plugins={plugins}
          onChange={commit}
          defaultRule={defaultRule}
        />
      ) : (
        <EmptyFilterMenu
          properties={properties}
          plugins={plugins}
          defaultRule={defaultRule}
          onAddRule={(propertyId, operator) =>
            table.setFilters(
              appendFilterNode(
                undefined,
                "",
                createFilterRule(propertyId, operator),
              ),
            )
          }
          onAddGroup={() =>
            table.setFilters(
              appendFilterNode(undefined, "", createFilterGroup()),
            )
          }
        />
      )}
    </section>
  );
}

function EmptyFilterMenu({
  properties,
  plugins,
  defaultRule,
  onAddRule,
  onAddGroup,
}: {
  properties: FilterProperty[];
  plugins: Record<string, CellPlugin>;
  defaultRule?: DefaultFilterRule;
  onAddRule: (propertyId: string, operator: string) => void;
  onAddGroup: () => void;
}) {
  const [addingRule, setAddingRule] = useState(false);
  const addRule = () => {
    if (defaultRule) {
      onAddRule(defaultRule.propertyId, defaultRule.operator);
      return;
    }
    setAddingRule(true);
  };

  return (
    <>
      {addingRule && (
        <PendingPropertyPicker
          properties={properties}
          plugins={plugins}
          onCancel={() => setAddingRule(false)}
          onSelect={(propertyId, operator) => onAddRule(propertyId, operator)}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="xs" variant="hint">
              + Add filter rule
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {properties.length > 0 && (
              <DropdownMenuItem label="Add rule" onClick={addRule} />
            )}
            <DropdownMenuItem label="Add nested group" onClick={onAddGroup} />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
