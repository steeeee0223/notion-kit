import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

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

function Demo() {
  const [lang, setLang] = useState("plain-text");
  return (
    <div className="min-w-200">
      <CodeBlock>
        <CodeBlockLang value={lang} onChange={setLang} />
        <CodeBlockToolbar />
        <CodeBlockContent>Hello world</CodeBlockContent>
        <CodeBlockCaption>Caption</CodeBlockCaption>
      </CodeBlock>
    </div>
  );
}

export const Default: Story = {
  render: Demo,
};
