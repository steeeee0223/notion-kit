import { useId, useState } from "react";

import { Icon } from "@notion-kit/icons";
import { formatId, type IdPlugin } from "@notion-kit/table-hook/plugins";
import {
  Button,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  Field,
  FieldLabel,
  Input,
} from "@notion-kit/ui/primitives";

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
  const prefix = draft.trim();
  const examples = [1, 2, 3]
    .map((number) => formatId({ prefix, number }))
    .join(", ");
  return (
    <form
      className="flex flex-col gap-3 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange({ prefix });
      }}
    >
      <Field className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
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
      <p className="text-sm text-muted">{examples}, …</p>
      <Button type="submit" variant="blue" disabled={prefix === config.prefix}>
        {config.prefix ? "Save prefix" : "Add ID prefix"}
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
      <DropdownMenuSub>
        <DropdownMenuSubTrigger label="Edit property" icon={<Icon.Sliders />} />
        <DropdownMenuContent sideOffset={-4} className="w-75">
          <IdConfigMenu key={props.config.prefix} {...props} />
        </DropdownMenuContent>
      </DropdownMenuSub>
    )),
    renderGroupingValue: DefaultGroupingValue,
  };
}
