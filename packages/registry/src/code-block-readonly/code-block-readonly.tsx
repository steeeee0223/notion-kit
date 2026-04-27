"use client";

import {
  CodeBlock,
  CodeBlockCaption,
  CodeBlockContent,
  CodeBlockLang,
  CodeBlockToolbar,
} from "@notion-kit/code-block";

const sampleCode = `interface Config {
  host: string;
  port: number;
  debug?: boolean;
}

const config: Config = {
  host: "localhost",
  port: 3000,
  debug: true,
};
`;

export default function Readonly() {
  return (
    <CodeBlock
      className="w-full"
      readonly
      defaultValue={{
        code: sampleCode,
        lang: "typescript",
        caption: "This code block is readonly",
      }}
    >
      <CodeBlockLang />
      <CodeBlockToolbar />
      <CodeBlockContent />
      <CodeBlockCaption />
    </CodeBlock>
  );
}
