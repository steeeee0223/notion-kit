import { readReferences } from "@notion-kit/table-hook/plugins";
import type {
  CreatedByPlugin,
  LastEditedByPlugin,
  PersonPlugin,
  PropertyReference,
} from "@notion-kit/table-hook/plugins";

import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";
import { useTableViewCtx } from "@/table-contexts";

import { PropertyCell, propertyMetadata } from "../property-cell";
import { ReferenceAvatar, ReferencePicker } from "../reference-picker";
import type { ReadOnlyValueProps, TableUiPlugin } from "../registry";
import {
  createBulkEditorRenderer,
  createCellRenderer,
  type CellRendererProps,
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
          <span className="truncate">{reference.name || reference.id}</span>
        </span>
      ))}
    </span>
  );
}

function renderPeopleValue({ value, textValue }: ReadOnlyValueProps) {
  const people = readReferences(value);
  return people.length ? <People people={people} /> : textValue;
}

function PeoplePicker({
  value,
  onChange,
}: {
  value: PropertyReference[];
  onChange: (people: PropertyReference[]) => void;
}) {
  const { propertySources } = useTableViewCtx();
  return (
    <ReferencePicker
      value={value}
      options={propertySources?.people ?? []}
      label="Search people"
      onChange={onChange}
      avatars
    />
  );
}

function PersonCell({
  editable,
  ...props
}: CellRendererProps<PropertyReference[]> & { editable?: boolean }) {
  return (
    <PropertyCell
      cell={props}
      text={props.textValue}
      renderEditor={
        editable
          ? () => <PeoplePicker value={props.data} onChange={props.onChange} />
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
        {(data, onChange) => <PeoplePicker value={data} onChange={onChange} />}
      </BulkEditorPopover>
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
