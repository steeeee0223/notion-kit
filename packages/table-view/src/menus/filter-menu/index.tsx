import { useState } from "react";

import {
  appendFilterNode,
  createFilterGroup,
  createFilterRule,
} from "@notion-kit/table-hook";
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
          <section
            aria-label="Filters"
            className="flex w-full min-w-0 flex-col gap-2 p-2"
          >
            {validFilters ? (
              <FilterGroupEditor
                group={validFilters}
                root={validFilters}
                depth={1}
              />
            ) : (
              <EmptyFilterMenu />
            )}
          </section>
        );
      }}
    </table.Subscribe>
  );
}

function EmptyFilterMenu() {
  const { table } = useTableViewCtx();
  const [addingRule, setAddingRule] = useState(false);
  const properties = table.getFilterProperties();
  const defaultRule = table.getTitleFilterRule();
  const addRule = () => {
    if (defaultRule) {
      table.setFilters(
        appendFilterNode(
          undefined,
          "",
          createFilterRule(defaultRule.propertyId, defaultRule.operator),
        ),
      );
      return;
    }
    setAddingRule(true);
  };

  return (
    <>
      {addingRule && (
        <PendingPropertyPicker onCancel={() => setAddingRule(false)} />
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
            <DropdownMenuItem
              label="Add nested group"
              onClick={() =>
                table.setFilters(
                  appendFilterNode(undefined, "", createFilterGroup()),
                )
              }
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
