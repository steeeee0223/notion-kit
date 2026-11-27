import { Icon } from "@notion-kit/icons";
import { getRelatedDatabase } from "@notion-kit/table-hook";
import {
  getRollupCalculations,
  getRollupResultKind,
  type RelationConfig,
  type RollupCalculation,
  type RollupConfig,
  type RollupPlugin,
  type RollupValue,
} from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

import { ReadOnlyValue } from "@/edit-log/read-only-value";

import { FormatMenu } from "../number/number-config-menu/format-menu";
import { RoundingMenu } from "../number/number-config-menu/rounding-menu";
import { PropertyCell, propertyMetadata } from "../property-cell";
import { PropertySettingMenu } from "../property-setting-menu";
import type { TableUiPlugin } from "../registry";
import { useRelatedDatabases } from "../relation/use-related-databases";
import {
  createCellRenderer,
  createConfigMenuRenderer,
  type ConfigMenuRendererProps,
} from "../renderers";
import { DefaultGroupingValue } from "../utils";

function RollupSettings({
  config,
  onChange,
}: Pick<ConfigMenuRendererProps<RollupConfig>, "config" | "onChange">) {
  const { propertySources, local } = useRelatedDatabases();
  const relations = local.properties.filter(
    ({ type, isDeleted }) => type === "relation" && !isDeleted,
  );
  const relation = relations.find(({ id }) => id === config.relationPropertyId);
  const relationConfig = relation?.config as RelationConfig | undefined;
  const target =
    relationConfig &&
    getRelatedDatabase(relationConfig.databaseId, local, propertySources);
  const properties =
    target?.properties.filter(
      ({ type, isDeleted }) => type !== "rollup" && !isDeleted,
    ) ?? [];
  const property = properties.find(({ id }) => id === config.targetPropertyId);
  const calculations = getRollupCalculations(property?.type);
  return (
    <DropdownMenuGroup>
      <PropertySettingMenu
        label="Relation"
        value={relation?.id ?? null}
        options={relations.map(({ id, name }) => ({ value: id, label: name }))}
        onChange={(relationPropertyId) =>
          onChange({
            ...config,
            relationPropertyId,
            targetPropertyId: "",
            calculation: "original",
          })
        }
      />
      <PropertySettingMenu
        label="Property"
        value={property?.id ?? null}
        options={properties.map(({ id, name }) => ({ value: id, label: name }))}
        disabled={!target}
        onChange={(targetPropertyId) => {
          const next = properties.find(({ id }) => id === targetPropertyId);
          const supported = getRollupCalculations(next?.type).some(
            ({ value }) => value === config.calculation,
          );
          onChange({
            ...config,
            targetPropertyId,
            calculation: supported ? config.calculation : "original",
          });
        }}
      />
      <PropertySettingMenu
        label="Calculate"
        value={config.calculation}
        options={calculations}
        disabled={!property}
        onChange={(calculation) =>
          onChange({
            ...config,
            calculation: calculation as RollupCalculation,
            format: calculation.startsWith("percent-") ? "percent" : "number",
          })
        }
      />
      {getRollupResultKind(config.calculation) === "number" && (
        <>
          <FormatMenu
            format={config.format}
            onUpdate={(format) => onChange({ ...config, format })}
          />
          <RoundingMenu
            round={config.round}
            onUpdate={(round) => onChange({ ...config, round })}
          />
        </>
      )}
    </DropdownMenuGroup>
  );
}

function RollupDisplay({ data }: { data: RollupValue }) {
  if (data?.kind !== "list")
    return <span className="truncate">{data?.text}</span>;
  return (
    <div className="flex min-w-0 flex-wrap gap-1">
      {data.value.map((entry, index) => {
        const id = `${entry.row.id}:${index}`;
        return (
          <div key={id} className="min-w-0 truncate">
            <ReadOnlyValue
              record={{
                id,
                property: data.property,
                value: entry.data,
                textValue: entry.text,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function rollup(): TableUiPlugin<RollupPlugin> {
  return {
    id: "rollup",
    ...propertyMetadata(
      "rollup",
      "Rollup",
      "Displays or aggregates properties from related rows.",
    ),
    renderCell: createCellRenderer<RollupPlugin>((props) => (
      <PropertyCell
        cell={props}
        text={props.textValue}
        renderEditor={() => (
          <RollupSettings
            config={props.config}
            onChange={(config) => props.onConfigChange?.(config)}
          />
        )}
      >
        <RollupDisplay data={props.data} />
      </PropertyCell>
    )),
    renderConfigMenu: createConfigMenuRenderer<RollupPlugin>((props) => (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger icon={<Icon.Sliders />} label="Edit property" />
        <DropdownMenuContent sideOffset={-4} className="w-75">
          <RollupSettings {...props} />
        </DropdownMenuContent>
      </DropdownMenuSub>
    )),
    renderGroupingValue: DefaultGroupingValue,
  };
}
