import type { ComponentProps } from "react";
import { Pre } from "fumadocs-ui/components/codeblock";
import {
  TypeTable as FumadocsTypeTable,
  type TypeNode as FumadocsTypeNode,
  type ParameterNode,
} from "fumadocs-ui/components/type-table";

export interface TypeNode
  extends Omit<
    FumadocsTypeNode,
    "type" | "typeDescription" | "default" | "parameters" | "returns"
  > {
  type: string;
  typeDescription?: string;
  default?: string;
  parameters?: (ParameterNode & { type: string })[];
  returns?: string;
}

export interface TypeTableProps
  extends Omit<ComponentProps<typeof FumadocsTypeTable>, "type"> {
  type: Record<string, TypeNode>;
}

function renderCode(value: string | undefined) {
  return value === undefined ? undefined : <Pre>{value}</Pre>;
}

export function TypeTable({ type, ...props }: TypeTableProps) {
  const formattedType = Object.fromEntries(
    Object.entries(type).map(([name, field]): [string, FumadocsTypeNode] => [
      name,
      {
        ...field,
        type: renderCode(field.type),
        typeDescription: renderCode(field.typeDescription),
        default: renderCode(field.default),
        returns: renderCode(field.returns),
        parameters: field.parameters?.map(({ type, ...parameter }) => ({
          ...parameter,
          description: (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              {renderCode(type)}
              {parameter.description}
            </span>
          ),
        })),
      },
    ]),
  );

  return <FumadocsTypeTable {...props} type={formattedType} />;
}
