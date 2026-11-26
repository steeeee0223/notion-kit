import { useState } from "react";
import { v4 } from "uuid";

import {
  applyRelationChanges,
  getRelatedDatabase,
  getRelatedRowOptions,
  type RelationChange,
} from "@notion-kit/table-hook";
import type {
  PropertyReference,
  RelationConfig,
  RelationPlugin,
} from "@notion-kit/table-hook/plugins";
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
import { PropertyConfigSelect } from "../property-config-select";
import { ReferencePicker } from "../reference-picker";
import type { TableUiPlugin } from "../registry";
import {
  createCellRenderer,
  createConfigMenuRenderer,
  type CellRendererProps,
  type ConfigMenuRendererProps,
} from "../renderers";
import { DefaultGroupingValue } from "../utils";
import { useRelatedDatabases } from "./use-related-databases";

const relationLimits = [
  { value: "one", label: "1 page" },
  { value: "unlimited", label: "No limit" },
] satisfies { value: RelationConfig["limit"]; label: string }[];

function RelationSettings({
  propId,
  config,
  onChange,
}: ConfigMenuRendererProps<RelationConfig>) {
  const { table, propertySources, local, databases } = useRelatedDatabases();
  const target = getRelatedDatabase(config.databaseId, local, propertySources);
  const reciprocalName = target?.properties.find(
    ({ id }) => id === config.reciprocalPropertyId,
  )?.name;
  const [reverseName, setReverseName] = useState(reciprocalName ?? local.name);
  const renameReverse = () => {
    const name = reverseName.trim();
    if (
      !name ||
      !target ||
      !config.reciprocalPropertyId ||
      name === reciprocalName
    )
      return;
    if (target.id === local.id)
      table.setColumnInfo(config.reciprocalPropertyId, { name });
    else
      propertySources?.renameReciprocalRelation?.(
        target.id,
        config.reciprocalPropertyId,
        name,
      );
  };
  const canCreateReverse = Boolean(
    target &&
    (target.id === local.id || propertySources?.createReciprocalRelation),
  );
  const configureReverse = (enable: boolean) => {
    if (!target || !canCreateReverse) return;
    if (!enable) {
      if (config.reciprocalPropertyId && target.id === local.id)
        table.setColumnInfo(config.reciprocalPropertyId, { isDeleted: true });
      else if (config.reciprocalPropertyId)
        propertySources?.removeReciprocalRelation?.(
          target.id,
          config.reciprocalPropertyId,
        );
      onChange({ ...config, reciprocalPropertyId: undefined });
      return;
    }
    const name = reverseName.trim() || local.name;
    const reciprocalPropertyId =
      target.id === local.id
        ? v4()
        : propertySources?.createReciprocalRelation?.({
            sourceDatabaseId: local.id,
            sourcePropertyId: propId,
            targetDatabaseId: target.id,
            name,
          });
    if (!reciprocalPropertyId) return;
    if (target.id === local.id) {
      table.addColumnInfo({
        id: reciprocalPropertyId,
        name: table.generateUniqueColumnName(name),
        type: "relation",
        config: {
          databaseId: local.id,
          limit: "unlimited",
          reciprocalPropertyId: propId,
        } satisfies RelationConfig,
      });
    }
    onChange({ ...config, reciprocalPropertyId });
    const changes = local.rows.flatMap((row): RelationChange[] => {
      const selected = row.properties[propId]?.value as
        PropertyReference[] | undefined;
      if (!selected?.length) return [];
      return [
        {
          sourceDatabaseId: local.id,
          sourcePropertyId: propId,
          sourceRowId: row.id,
          targetDatabaseId: target.id,
          targetPropertyId: reciprocalPropertyId,
          previousRowIds: [],
          nextRowIds: selected.map(({ id }) => id),
        },
      ];
    });
    if (changes.length === 0) return;
    if (target.id === local.id) {
      table.setTableData((rows) => applyRelationChanges(rows, changes), {
        id: v4(),
        type: "data.cell.update",
        payload: {
          propertyId: reciprocalPropertyId,
          rowIds: [...new Set(changes.flatMap(({ nextRowIds }) => nextRowIds))],
        },
      });
    } else propertySources?.onRelationChanges?.(changes);
  };
  const targetProperties =
    target?.properties
      .filter(({ isDeleted }) => !isDeleted)
      .map(({ id, name }) => ({ id, name })) ?? [];
  const displayed = targetProperties.filter(({ id }) =>
    config.displayPropertyIds?.includes(id),
  );
  return (
    <div className="flex flex-col gap-3">
      <PropertyConfigSelect
        label="Related database"
        value={target?.id ?? null}
        items={databases.map(({ id, name }) => ({ value: id, label: name }))}
        onChange={(databaseId) =>
          onChange({
            ...config,
            databaseId,
            reciprocalPropertyId: undefined,
            displayPropertyIds: [],
          })
        }
        disabled={
          Boolean(config.reciprocalPropertyId) ||
          local.rows.some(
            ({ properties }) =>
              Array.isArray(properties[propId]?.value) &&
              properties[propId].value.length > 0,
          )
        }
      />
      <PropertyConfigSelect<RelationConfig["limit"]>
        label="Limit"
        value={config.limit}
        items={relationLimits}
        onChange={(limit) => onChange({ ...config, limit })}
      />
      {canCreateReverse && (
        <Field>
          <FieldLabel htmlFor={`reciprocal-name-${propId}`}>
            Related property name
          </FieldLabel>
          <Input
            id={`reciprocal-name-${propId}`}
            value={reverseName}
            onBlur={renameReverse}
            onChange={(event) => setReverseName(event.currentTarget.value)}
          />
          <Button
            variant="hint"
            onClick={() => configureReverse(!config.reciprocalPropertyId)}
          >
            {config.reciprocalPropertyId
              ? "Remove two-way relation"
              : "Create two-way relation"}
          </Button>
        </Field>
      )}
      {targetProperties.length > 0 && (
        <Field>
          <FieldLabel>Displayed properties</FieldLabel>
          <ReferencePicker
            value={displayed}
            options={targetProperties}
            label="Choose displayed properties"
            onChange={(references) =>
              onChange({
                ...config,
                displayPropertyIds: references.map(({ id }) => id),
              })
            }
          />
        </Field>
      )}
    </div>
  );
}

function RelationEditor({
  close,
  ...props
}: CellRendererProps<PropertyReference[], RelationConfig> & {
  close: () => void;
}) {
  const { table, propertySources, local } = useRelatedDatabases();
  const target = getRelatedDatabase(
    props.config.databaseId,
    local,
    propertySources,
  );
  const options = target ? getRelatedRowOptions(target) : [];
  const [newTitle, setNewTitle] = useState("");
  const createRelatedPage = (title: string) => {
    if (!target) return;
    const titleProperty = target.properties.find(
      ({ type, isDeleted }) => type === "title" && !isDeleted,
    );
    const reference =
      target.id === local.id && titleProperty
        ? {
            id: table.addRow({ initialValues: { [titleProperty.id]: title } }),
            name: title,
          }
        : propertySources?.createRelatedRow?.(target.id, title);
    if (!reference) return;
    props.onChange((selected) =>
      props.config.limit === "one" ? [reference] : [...selected, reference],
    );
    setNewTitle("");
  };
  const linkedRows = props.data.map((reference) => {
    const row = target?.rows.find(({ id }) => id === reference.id);
    const details = target?.properties.flatMap((property) => {
      if (!row || !props.config.displayPropertyIds?.includes(property.id))
        return [];
      const plugin = table.atoms.cellPlugins.get()[property.type];
      const data: unknown =
        row.properties[property.id]?.value ?? plugin?.default.data;
      const text = plugin?.toTextValue(data, row);
      return text ? [`${property.name}: ${text}`] : [];
    });
    return { ...reference, details };
  });
  return (
    <div className="flex flex-col gap-2">
      {linkedRows.map(({ id, name, href, details }) => {
        const caption = (
          <>
            {name || id}
            {details?.length ? (
              <small className="block text-secondary">
                {details.join(" · ")}
              </small>
            ) : null}
          </>
        );
        return href ? (
          <a key={id} href={href} className="underline">
            {caption}
          </a>
        ) : rowExists(id, target?.id === local.id ? local.rows : []) ? (
          <Button
            key={id}
            variant="hint"
            onClick={() => {
              close();
              table.openRow(id);
            }}
          >
            {caption}
          </Button>
        ) : (
          <span key={id}>{caption}</span>
        );
      })}
      {target ? (
        <>
          <ReferencePicker
            value={props.data}
            options={options}
            label="Search related pages"
            single={props.config.limit === "one"}
            onChange={props.onChange}
          />
          {(target.id === local.id || propertySources?.createRelatedRow) && (
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (newTitle.trim()) createRelatedPage(newTitle.trim());
              }}
            >
              <Input
                aria-label="New related page name"
                value={newTitle}
                onChange={(event) => setNewTitle(event.currentTarget.value)}
              />
              <Button type="submit" disabled={!newTitle.trim()}>
                Create page
              </Button>
            </form>
          )}
        </>
      ) : (
        <RelationSettings
          propId={props.propId}
          config={props.config}
          onChange={(config) => props.onConfigChange?.(config)}
        />
      )}
    </div>
  );
}

function rowExists(id: string, rows: readonly { id: string }[]) {
  return rows.some((row) => row.id === id);
}

export function relation(): TableUiPlugin<RelationPlugin> {
  return {
    id: "relation",
    ...propertyMetadata(
      "relation",
      "Relation",
      "Links rows in this or another database.",
    ),
    renderCell: createCellRenderer<RelationPlugin>((props) => (
      <PropertyCell
        cell={props}
        text={props.textValue}
        renderEditor={(close) => <RelationEditor {...props} close={close} />}
      />
    )),
    renderConfigMenu: createConfigMenuRenderer<RelationPlugin>((props) => (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger label="Relation settings" openOnHover={false} />
        <DropdownMenuContent sideOffset={-4} className="w-72 p-2">
          <RelationSettings {...props} />
        </DropdownMenuContent>
      </DropdownMenuSub>
    )),
    renderGroupingValue: DefaultGroupingValue,
  };
}
