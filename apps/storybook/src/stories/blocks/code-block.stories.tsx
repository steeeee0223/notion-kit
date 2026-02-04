import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { CodeBlockValue } from "@notion-kit/code-block";
import {
  CodeBlock,
  CodeBlockCaption,
  CodeBlockContent,
  CodeBlockLang,
  CodeBlockToolbar,
} from "@notion-kit/code-block";

const meta = {
  title: "blocks/Code Block",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return (
      <div className="w-200">
        <CodeBlock
          defaultValue={{
            code: "const greeting = 'Hello, World!';",
            lang: "javascript",
          }}
        >
          <CodeBlockLang />
          <CodeBlockToolbar />
          <CodeBlockContent />
          <CodeBlockCaption />
        </CodeBlock>
      </div>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<CodeBlockValue>({
      code: "function add(a: number, b: number): number {\n  return a + b;\n}",
      lang: "typescript",
    });

    return (
      <div className="w-200 space-y-4">
        <CodeBlock value={value} onChange={setValue}>
          <CodeBlockLang />
          <CodeBlockToolbar />
          <CodeBlockContent />
          <CodeBlockCaption />
        </CodeBlock>

        {/* Debug panel to show current state */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <h4 className="mb-2 font-semibold">Current State:</h4>
          <pre className="text-muted-foreground text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};
