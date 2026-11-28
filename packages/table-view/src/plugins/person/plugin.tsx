import type { ReactNode } from "react";

import { Icon } from "@notion-kit/icons";
import { readReferences, referenceLabel } from "@notion-kit/table-hook/plugins";
import type {
  CreatedByPlugin,
  LastEditedByPlugin,
  PersonConfig,
  PersonPlugin,
  PersonPluginOptions,
  PropertyReference,
} from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";
import { useTableViewCtx } from "@/table-contexts";

import { propertyMetadata } from "../property-cell";
import { PropertySettingMenu } from "../property-setting-menu";
import { ReferenceAvatar, ReferencePicker } from "../reference-picker";
import type { ReadOnlyValueProps, TableUiPlugin } from "../registry";
import {
  createBulkEditorRenderer,
  createCellRenderer,
  createConfigMenuRenderer,
  type CellRendererProps,
  type ConfigMenuRendererProps,
} from "../renderers";
import { SelectCell, SelectCellValues } from "../select/select-cell";
import { DefaultGroupingValue } from "../utils";

function People({
  people,
  wrapped,
}: {
  people: PropertyReference[];
  wrapped?: boolean;
}) {
  return (
    <SelectCellValues wrapped={wrapped}>
      {people.map((reference) => (
        <span
          className="inline-flex min-w-0 items-center gap-1"
          key={reference.id}
        >
          <ReferenceAvatar reference={reference} />
          <span className="truncate">{referenceLabel(reference)}</span>
        </span>
      ))}
    </SelectCellValues>
  );
}

function renderPeopleValue({ value, textValue }: ReadOnlyValueProps) {
  const people = readReferences(value);
  return people.length ? <People people={people} wrapped /> : textValue;
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
      <DropdownMenuSubTrigger label="Edit property" icon={<Icon.Sliders />} />
      <DropdownMenuContent sideOffset={-4} className="w-64">
        <DropdownMenuGroup>
          <PropertySettingMenu
            label="Limit"
            icon={<Icon.Numbers123 />}
            options={limitOptions}
            value={config.limit}
            onChange={(limit) => onChange((current) => ({ ...current, limit }))}
          />
          <PropertySettingMenu
            label="Default"
            icon={<Icon.PersonCircleOutline />}
            options={defaultOptions}
            value={config.defaultValue}
            onChange={(defaultValue) =>
              onChange((current) => ({ ...current, defaultValue }))
            }
          />
          <PropertySettingMenu
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
  accounts,
  value,
  onChange,
  limit,
  onClose,
}: {
  accounts?: readonly PropertyReference[];
  value: PropertyReference[];
  onChange: (people: PropertyReference[]) => void;
  limit: PersonConfig["limit"];
  onClose?: () => void;
}) {
  const { propertySources } = useTableViewCtx();
  return (
    <ReferencePicker
      value={value}
      options={accounts ?? propertySources?.people ?? []}
      label="Search people"
      onChange={onChange}
      onClose={onClose}
      avatars
      single={limit === "one"}
      heading={
        limit === "one" ? "Select one person" : "Select as many as you like"
      }
    />
  );
}

function PersonCell({
  renderEditor,
  ...props
}: Pick<
  CellRendererProps<PropertyReference[], unknown>,
  "data" | "surface" | "disabled" | "wrapped"
> & {
  renderEditor?: (close: () => void) => ReactNode;
}) {
  return (
    <SelectCell
      cell={props}
      isEmpty={props.data.length === 0}
      renderEditor={renderEditor}
      value={<People people={props.data} wrapped={props.wrapped} />}
    />
  );
}

export function person({
  accounts,
}: PersonPluginOptions = {}): TableUiPlugin<PersonPlugin> {
  return {
    id: "person",
    ...propertyMetadata("person", "Person", "Assign people to a row."),
    renderCell: createCellRenderer<PersonPlugin>((props) => (
      <PersonCell
        {...props}
        renderEditor={(close) => (
          <PeoplePicker
            accounts={accounts}
            value={props.data}
            onChange={props.onChange}
            limit={props.config.limit}
            onClose={close}
          />
        )}
      />
    )),
    renderBulkEditor: createBulkEditorRenderer<PersonPlugin>((props) => (
      <BulkEditorPopover {...props} initialData={props.data}>
        {(data, onChange) => (
          <PeoplePicker
            accounts={accounts}
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
