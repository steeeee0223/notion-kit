"use client";

import {
  CodeBlock,
  CodeBlockCaption,
  CodeBlockContent,
  CodeBlockLang,
  CodeBlockToolbar,
} from "@notion-kit/code-block";

const sampleMermaidCode = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Success! 🎉]
`;

export default function Mermaid() {
  return (
    <CodeBlock
      className="w-full"
      defaultValue={{ code: sampleMermaidCode, lang: "mermaid" }}
    >
      <CodeBlockLang />
      <CodeBlockToolbar />
      <CodeBlockContent />
      <CodeBlockCaption />
    </CodeBlock>
  );
}
