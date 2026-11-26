import { getRelatedDatabase } from "@notion-kit/table-hook";
import {
  getRollupCalculations,
  getRollupResultKind,
  type NumberConfig,
  type RelationConfig,
  type RollupCalculation,
  type RollupConfig,
  type RollupPlugin,
  type RollupValue,
} from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

import { ReadOnlyValue } from "@/edit-log/read-only-value";

import { PropertyCell, propertyMetadata } from "../property-cell";
import { PropertyConfigSelect } from "../property-config-select";
import type { TableUiPlugin } from "../registry";
import { useRelatedDatabases } from "../relation/use-related-databases";
import {
  createCellRenderer,
  createConfigMenuRenderer,
  type ConfigMenuRendererProps,
} from "../renderers";
import { DefaultGroupingValue } from "../utils";

const formats: { value: NumberConfig["format"]; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "number_with_commas", label: "Number with commas" },
  { value: "percent", label: "Percent" },
  { value: "currency", label: "Currency" },
];
const rounding: { value: NumberConfig["round"]; label: string }[] = [
  { value: "default", label: "Default" },
  ...(["0", "1", "2", "3", "4", "5"] as const).map((value) => ({
    value,
    label: value,
  })),
];

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
    <div className="flex flex-col gap-3">
      <PropertyConfigSelect
        label="Relation"
        value={relation?.id ?? null}
        items={relations.map(({ id, name }) => ({ value: id, label: name }))}
        onChange={(relationPropertyId) =>
          onChange({
            ...config,
            relationPropertyId,
            targetPropertyId: "",
            calculation: "original",
          })
        }
      />
      <PropertyConfigSelect
        label="Property"
        value={property?.id ?? null}
        items={properties.map(({ id, name }) => ({ value: id, label: name }))}
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
      <PropertyConfigSelect
        label="Calculate"
        value={config.calculation}
        items={calculations}
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
          <PropertyConfigSelect
            label="Number format"
            value={config.format}
            items={formats}
            onChange={(format) => onChange({ ...config, format })}
          />
          <PropertyConfigSelect
            label="Decimal places"
            value={config.round}
            items={rounding}
            onChange={(round) => onChange({ ...config, round })}
          />
        </>
      )}
    </div>
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
        <DropdownMenuSubTrigger label="Rollup settings" openOnHover={false} />
        <DropdownMenuContent sideOffset={-4} className="w-72 p-2">
          <RollupSettings {...props} />
        </DropdownMenuContent>
      </DropdownMenuSub>
    )),
    renderGroupingValue: DefaultGroupingValue,
  };
}
