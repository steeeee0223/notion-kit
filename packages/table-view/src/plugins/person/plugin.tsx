import type { ReactNode } from "react";

import { Icon } from "@notion-kit/icons";
import { readReferences, referenceLabel } from "@notion-kit/table-hook/plugins";
import type {
  CreatedByPlugin,
  LastEditedByPlugin,
  PersonConfig,
  PersonPlugin,
  PropertyReference,
} from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";
import { useTableViewCtx } from "@/table-contexts";

import { PropertyCell, propertyMetadata } from "../property-cell";
import { ReferenceAvatar, ReferencePicker } from "../reference-picker";
import type { ReadOnlyValueProps, TableUiPlugin } from "../registry";
import {
  createBulkEditorRenderer,
  createCellRenderer,
  createConfigMenuRenderer,
  type CellRendererProps,
  type ConfigMenuRendererProps,
} from "../renderers";
import { DefaultGroupingValue } from "../utils";

function People({ people }: { people: PropertyReference[] }) {
  return (
    <span className="flex min-w-0 flex-wrap gap-x-2 gap-y-1">
      {people.map((reference) => (
        <span
          className="inline-flex min-w-0 items-center gap-1"
          key={reference.id}
        >
          <ReferenceAvatar reference={reference} />
          <span className="truncate">{referenceLabel(reference)}</span>
        </span>
      ))}
    </span>
  );
}

function renderPeopleValue({ value, textValue }: ReadOnlyValueProps) {
  const people = readReferences(value);
  return people.length ? <People people={people} /> : textValue;
}

function PersonSetting<Value extends string>({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  options: readonly { label: string; value: Value }[];
  value: Value;
  onChange: (value: Value) => void;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger label={label} icon={icon} openOnHover={false}>
        <span className="text-muted">
          {options.find((option) => option.value === value)?.label}
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuContent sideOffset={-4}>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} {...option} />
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}

const limitOptions = [
  { value: "one", label: "1 Person" },
  { value: "unlimited", label: "No limit" },
] as const;
const defaultOptions = [
  { value: "none", label: "No default" },
  { value: "created-by", label: "Created by" },
] as const;
const notificationOptions = [
  { value: "individuals", label: "Individuals only" },
  { value: "individuals-and-groups", label: "Individuals & groups" },
  { value: "none", label: "None" },
] as const;

function PersonConfigMenu({
  config,
  onChange,
}: ConfigMenuRendererProps<PersonConfig>) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        label="Edit property"
        icon={<Icon.Sliders />}
        openOnHover={false}
      />
      <DropdownMenuContent sideOffset={-4} className="w-64">
        <DropdownMenuGroup>
          <PersonSetting
            label="Limit"
            icon={<Icon.Numbers123 />}
            options={limitOptions}
            value={config.limit}
            onChange={(limit) => onChange((current) => ({ ...current, limit }))}
          />
          <PersonSetting
            label="Default"
            icon={<Icon.PersonCircle />}
            options={defaultOptions}
            value={config.defaultValue}
            onChange={(defaultValue) =>
              onChange((current) => ({ ...current, defaultValue }))
            }
          />
          <PersonSetting
            label="Notifications"
            icon={<Icon.Bell />}
            options={notificationOptions}
            value={config.notifications}
            onChange={(notifications) =>
              onChange((current) => ({ ...current, notifications }))
            }
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}

function PeoplePicker({
  value,
  onChange,
  limit,
}: {
  value: PropertyReference[];
  onChange: (people: PropertyReference[]) => void;
  limit: PersonConfig["limit"];
}) {
  const { propertySources } = useTableViewCtx();
  return (
    <ReferencePicker
      value={value}
      options={propertySources?.people ?? []}
      label="Search people"
      onChange={onChange}
      avatars
      single={limit === "one"}
      heading={
        limit === "one" ? "Select one person" : "Select as many as you like"
      }
    />
  );
}

function PersonCell({
  editable,
  ...props
}: Omit<
  CellRendererProps<PropertyReference[], PersonConfig | undefined>,
  "onConfigChange"
> & { editable?: boolean }) {
  return (
    <PropertyCell
      cell={props}
      text={props.textValue}
      renderEditor={
        editable
          ? () => (
              <PeoplePicker
                value={props.data}
                onChange={props.onChange}
                limit={props.config?.limit ?? "unlimited"}
              />
            )
          : undefined
      }
    >
      <People people={props.data} />
    </PropertyCell>
  );
}

export function person(): TableUiPlugin<PersonPlugin> {
  return {
    id: "person",
    ...propertyMetadata("person", "Person", "Assign people to a row."),
    renderCell: createCellRenderer<PersonPlugin>((props) => (
      <PersonCell {...props} editable />
    )),
    renderBulkEditor: createBulkEditorRenderer<PersonPlugin>((props) => (
      <BulkEditorPopover {...props} initialData={props.data}>
        {(data, onChange) => (
          <PeoplePicker
            value={data}
            onChange={onChange}
            limit={props.config.limit}
          />
        )}
      </BulkEditorPopover>
    )),
    renderConfigMenu: createConfigMenuRenderer<PersonPlugin>((props) => (
      <PersonConfigMenu {...props} />
    )),
    renderReadOnlyValue: renderPeopleValue,
    renderGroupingValue: DefaultGroupingValue,
  };
}

export function createdBy(): TableUiPlugin<CreatedByPlugin> {
  return {
    id: "created-by",
    ...propertyMetadata(
      "created-by",
      "Created by",
      "Shows who created the row.",
    ),
    renderCell: createCellRenderer<CreatedByPlugin>((props) => (
      <PersonCell {...props} />
    )),
    renderReadOnlyValue: renderPeopleValue,
    renderGroupingValue: DefaultGroupingValue,
  };
}

export function lastEditedBy(): TableUiPlugin<LastEditedByPlugin> {
  return {
    id: "last-edited-by",
    ...propertyMetadata(
      "last-edited-by",
      "Last edited by",
      "Shows who last edited the row.",
    ),
    renderCell: createCellRenderer<LastEditedByPlugin>((props) => (
      <PersonCell {...props} />
    )),
    renderReadOnlyValue: renderPeopleValue,
    renderGroupingValue: DefaultGroupingValue,
  };
}
