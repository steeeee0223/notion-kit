import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { SingleImageDropzone } from "@notion-kit/ui/single-image-dropzone";

const meta = {
  title: "blocks/Single Image Dropzone",
  component: SingleImageDropzone,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SingleImageDropzone>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
