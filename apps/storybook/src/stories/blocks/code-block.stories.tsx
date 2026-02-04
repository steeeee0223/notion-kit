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
  return (
    <div className="min-w-200">
      <CodeBlock>
        <CodeBlockLang />
        <CodeBlockToolbar />
        <CodeBlockContent />
        <CodeBlockCaption />
      </CodeBlock>
    </div>
  );
}

export const Default: Story = {
  render: Demo,
};
