import { useId, useState } from "react";

import type { IdPlugin } from "@notion-kit/table-hook/plugins";
import { Button, Field, FieldLabel, Input } from "@notion-kit/ui/primitives";

import { PropertyCell, propertyMetadata } from "../property-cell";
import type { TableUiPlugin } from "../registry";
import {
  createCellRenderer,
  createConfigMenuRenderer,
  type ConfigMenuRendererProps,
} from "../renderers";
import { DefaultGroupingValue } from "../utils";

function IdConfigMenu({
  config,
  onChange,
}: ConfigMenuRendererProps<IdPlugin["default"]["config"]>) {
  const [draft, setDraft] = useState(config.prefix);
  const inputId = useId();
  return (
    <form
      className="flex flex-col gap-2 px-2 pb-2"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange({ prefix: draft.trim() });
      }}
    >
      <Field>
        <FieldLabel htmlFor={inputId}>Prefix</FieldLabel>
        <Input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key !== "Escape") event.stopPropagation();
          }}
          placeholder="TASK"
        />
      </Field>
      <Button type="submit" disabled={draft.trim() === config.prefix}>
        Save prefix
      </Button>
    </form>
  );
}

export function id(): TableUiPlugin<IdPlugin> {
  return {
    id: "id",
    ...propertyMetadata(
      "id",
      "ID",
      "Assigns an immutable number to each row. A prefix is optional.",
    ),
    renderCell: createCellRenderer<IdPlugin>((props) => (
      <PropertyCell cell={props} text={props.textValue} />
    )),
    renderConfigMenu: createConfigMenuRenderer<IdPlugin>((props) => (
      <IdConfigMenu key={props.config.prefix} {...props} />
    )),
    renderGroupingValue: DefaultGroupingValue,
  };
}
