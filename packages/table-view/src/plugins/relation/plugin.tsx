import { useState } from "react";
import { v4 } from "uuid";

import {
  applyRelationChanges,
  getRelatedDatabase,
  getRelatedRowOptions,
  type RelatedDatabase,
  type RelationChange,
} from "@notion-kit/table-hook";
import {
  referenceLabel,
  type PropertyReference,
  type RelationConfig,
  type RelationPlugin,
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

import { useTableViewCtx } from "@/table-contexts";

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

function ReciprocalRelationSettings({
  propId,
  config,
  onChange,
  local,
  target,
}: ConfigMenuRendererProps<RelationConfig> & {
  local: RelatedDatabase;
  target?: RelatedDatabase;
}) {
  const { table, propertySources } = useTableViewCtx();
  const isLocal = target?.id === local.id;
  const reciprocalId = config.reciprocalPropertyId;
  const reciprocalName = target?.properties.find(
    ({ id }) => id === reciprocalId,
  )?.name;
  const [reverseName, setReverseName] = useState(reciprocalName ?? local.name);
  if (!target) return null;

  const renameReverse = () => {
    const name = reverseName.trim();
    if (!name || !reciprocalId || name === reciprocalName) return;
    if (isLocal) table.setColumnInfo(reciprocalId, { name });
    else
      propertySources?.renameReciprocalRelation?.(
        target.id,
        reciprocalId,
        name,
      );
  };
  const canRenameReverse =
    isLocal || Boolean(propertySources?.renameReciprocalRelation);
  const reverseAction = reciprocalId
    ? propertySources?.removeReciprocalRelation
    : propertySources?.onRelationChanges &&
      propertySources.createReciprocalRelation;
  const canConfigureReverse = isLocal || Boolean(reverseAction);
  const toggleReverse = () => {
    if (reciprocalId) {
      if (isLocal) table.setColumnInfo(reciprocalId, { isDeleted: true });
      else propertySources?.removeReciprocalRelation?.(target.id, reciprocalId);
      onChange({ ...config, reciprocalPropertyId: undefined });
      return;
    }
    const name = reverseName.trim() || local.name;
    const reciprocalPropertyId = isLocal
      ? v4()
      : propertySources?.createReciprocalRelation?.({
          sourceDatabaseId: local.id,
          sourcePropertyId: propId,
          targetDatabaseId: target.id,
          name,
        });
    if (!reciprocalPropertyId) return;
    if (isLocal) {
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
    if (isLocal) {
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
  if (!canConfigureReverse && !(reciprocalId && canRenameReverse)) return null;

  return (
    <Field>
      <FieldLabel htmlFor={`reciprocal-name-${propId}`}>
        Related property name
      </FieldLabel>
      <Input
        id={`reciprocal-name-${propId}`}
        value={reverseName}
        disabled={Boolean(reciprocalId) && !canRenameReverse}
        onBlur={renameReverse}
        onChange={(event) => setReverseName(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key !== "Escape") event.stopPropagation();
        }}
      />
      {canConfigureReverse && (
        <Button variant="hint" onClick={toggleReverse}>
          {reciprocalId ? "Remove two-way relation" : "Create two-way relation"}
        </Button>
      )}
    </Field>
  );
}

function RelationSettings(props: ConfigMenuRendererProps<RelationConfig>) {
  const { propId, config, onChange } = props;
  const { propertySources, local, databases } = useRelatedDatabases();
  const target = getRelatedDatabase(config.databaseId, local, propertySources);
  const linkedPages = local.rows.map(({ properties }) => {
    const value: unknown = properties[propId]?.value;
    return Array.isArray(value) ? value.length : 0;
  });
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
            databaseId,
            limit: config.limit,
          })
        }
        disabled={
          Boolean(config.reciprocalPropertyId) ||
          linkedPages.some((count) => count > 0)
        }
      />
      <PropertyConfigSelect<RelationConfig["limit"]>
        label="Limit"
        value={config.limit}
        items={[
          {
            value: "one",
            label: "1 page",
            disabled: linkedPages.some((count) => count > 1),
          },
          { value: "unlimited", label: "No limit" },
        ]}
        onChange={(limit) => onChange({ ...config, limit })}
      />
      <ReciprocalRelationSettings {...props} local={local} target={target} />
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
      if (
        !row ||
        property.isDeleted ||
        !props.config.displayPropertyIds?.includes(property.id)
      )
        return [];
      const plugin = table.atoms.cellPlugins.get()[property.type];
      const data: unknown =
        row.properties[property.id]?.value ?? plugin?.default.data;
      const text = plugin?.toTextValue(data, row);
      return text ? [`${property.name}: ${text}`] : [];
    });
    return {
      ...reference,
      details,
      isLocal: Boolean(row && target?.id === local.id),
    };
  });
  return (
    <div className="flex flex-col gap-2">
      {linkedRows.map((reference) => {
        const { id, href, details, isLocal } = reference;
        const caption = (
          <>
            {referenceLabel(reference)}
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
        ) : isLocal ? (
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
            onChange={(references) => {
              props.onChange(references);
              if (props.config.limit === "one" && references.length) close();
            }}
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
