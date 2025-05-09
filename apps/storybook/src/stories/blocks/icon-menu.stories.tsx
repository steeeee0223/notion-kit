import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";

const meta = {
  title: "blocks/Icon Menu",
  component: IconMenu,
} satisfies Meta<typeof IconMenu>;
export default meta;

type Story = StoryObj<typeof meta>;

const defaultIcon: IconData = { type: "text", src: "S" };
const Template: Story["render"] = () => {
  const [icon, setIcon] = useState<IconData>(defaultIcon);
  return (
    <IconMenu
      onSelect={setIcon}
      onRemove={() => setIcon(defaultIcon)}
      onUpload={(file) =>
        setIcon({
          type: "url",
          src: URL.createObjectURL(file),
        })
      }
    >
      <IconBlock icon={icon} size="lg" />
    </IconMenu>
  );
};

export const Default: Story = {
  render: Template,
};
