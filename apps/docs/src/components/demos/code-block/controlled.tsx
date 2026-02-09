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
    <div className="w-full space-y-4">
      <CodeBlock value={value} onChange={setValue}>
        <CodeBlockLang />
        <CodeBlockToolbar />
        <CodeBlockContent />
        <CodeBlockCaption />
      </CodeBlock>

      <div className="rounded-lg bg-muted p-4 text-sm">
        <h4 className="mb-2 font-semibold">Current State:</h4>
        <pre className="text-xs text-muted">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
}
