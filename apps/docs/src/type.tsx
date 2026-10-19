import React from "react";
import { TypeNode, TypeTable } from "fumadocs-ui/components/type-table";

import { cn } from "@notion-kit/cn";

export type TypeApi = Record<string, TypeNode>;

function Pre({ className, ...props }: React.ComponentProps<"pre">) {
  return (
    <pre
      className={cn(
        "w-fit rounded-sm bg-slate-200 px-0.5 text-xs text-red decoration-red",
        className,
      )}
      {...props}
    />
  );
}

const funcType: TypeNode = {
  type: <Pre>{`(a: string, b: string) => string`}</Pre>,
  parameters: [
    {
      name: "a",
      description: (
        <div className="inline-flex items-center gap-1.5">
          <Pre>string</Pre> a short string
        </div>
      ),
    },
    {
      name: "b",
      description: (
        <div className="inline-flex items-center gap-1.5">
          <Pre>string</Pre> a short string
        </div>
      ),
    },
  ],
  returns: <Pre>string</Pre>,
};
const objType: TypeNode = {
  type: <Pre>object</Pre>,
  default: <Pre>{`{}`}</Pre>,
  description: "an object",
  typeDescription: <Pre>{`{ a: string, b: string }`}</Pre>,
  typeDescriptionLink: "https://example.com",
};
const reqType: TypeNode = {
  type: <Pre>number</Pre>,
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
