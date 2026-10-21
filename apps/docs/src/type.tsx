import {
  TypeTable,
  type TypeNode,
  type TypeTableProps,
} from "@/components/docs/type-table";

export type TypeApi = TypeTableProps["type"];

const funcType: TypeNode = {
  type: "(a: string, b: string) => string",
  parameters: [
    {
      name: "a",
      type: "string",
      description: "a short string",
    },
    {
      name: "b",
      type: "string",
      description: "a short string",
    },
  ],
  returns: "string",
};
const objType: TypeNode = {
  type: "object",
  default: "{}",
  description: "an object",
  typeDescription: "{ a: string, b: string }",
  typeDescriptionLink: "https://example.com",
};
const reqType: TypeNode = {
  type: "number",
  required: true,
  description: "required number",
};

const typeApi: TypeApi = {
  func: funcType,
  obj: objType,
  num: reqType,
};

export function ExampleTypeTable() {
  return <TypeTable type={typeApi} />;
}
