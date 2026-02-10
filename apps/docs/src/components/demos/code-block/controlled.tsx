"use client";

import { useState } from "react";

import type { CodeBlockValue } from "@notion-kit/code-block";
import {
  CodeBlock,
  CodeBlockCaption,
  CodeBlockContent,
  CodeBlockLang,
  CodeBlockToolbar,
} from "@notion-kit/code-block";

const sampleCode = `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const result = greet("World");
console.log(result);
`;

export default function Controlled() {
  const [value, setValue] = useState<CodeBlockValue>({
    code: sampleCode,
    lang: "typescript",
  });

  return (
    <CodeBlock className="w-full" value={value} onChange={setValue}>
      <CodeBlockLang />
      <CodeBlockToolbar />
      <CodeBlockContent />
      <CodeBlockCaption />
    </CodeBlock>
  );
}
