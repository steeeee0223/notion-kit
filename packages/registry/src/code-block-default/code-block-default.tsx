"use client";

import {
  CodeBlock,
  CodeBlockCaption,
  CodeBlockContent,
  CodeBlockLang,
  CodeBlockToolbar,
} from "@notion-kit/code-block";

const sampleCode = `// Generics with 'extends' and default values
function identity<T extends number | string = string>(arg: T): T {
  return arg;
}

let str = identity();  // Default type is string
let num = identity(42);  // T inferred as number

// Generic interfaces with 'extends' and default types
interface Box<T extends object = { message: string }> {
  content: T;
}

let defaultBox: Box = { content: { message: "Hello" } };
let customBox: Box<{ status: number }> = { content: { status: 200 } };
`;

export default function Default() {
  return (
    <CodeBlock
      className="w-full"
      defaultValue={{
        code: sampleCode,
        lang: "typescript",
      }}
    >
      <CodeBlockLang />
      <CodeBlockToolbar />
      <CodeBlockContent />
      <CodeBlockCaption />
    </CodeBlock>
  );
}
