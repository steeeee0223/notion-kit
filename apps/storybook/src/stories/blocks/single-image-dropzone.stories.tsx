import type { Meta, StoryObj } from "@storybook/react";

import { SingleImageDropzone } from "@notion-kit/single-image-dropzone";

const meta = {
  title: "blocks/Single Image Dropzone",
  component: SingleImageDropzone,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof SingleImageDropzone>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
