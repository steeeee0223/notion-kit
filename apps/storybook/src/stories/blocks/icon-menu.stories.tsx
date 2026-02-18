import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { IconBlock, type IconData } from "@notion-kit/icon-block";
import {
  IconFactoryResult,
  IconMenu,
  useEmojiFactory,
  useLucideFactory,
  useNotionIconsFactory,
} from "@notion-kit/icon-menu";

const meta = {
  title: "blocks/Icon Menu",
  component: IconMenu,
} satisfies Meta<typeof IconMenu>;
export default meta;

type Story = StoryObj<typeof meta>;

const defaultIcon: IconData = { type: "text", src: "S" };

function IconPicker({ factories }: { factories?: IconFactoryResult[] }) {
  const [icon, setIcon] = useState<IconData>(defaultIcon);
  return (
    <IconMenu
      factories={factories}
      onSelect={setIcon}
      onRemove={() => setIcon(defaultIcon)}
      onUpload={(file) =>
        setIcon({ type: "url", src: URL.createObjectURL(file) })
      }
    >
      <IconBlock icon={icon} size="lg" />
    </IconMenu>
  );
}

export const Default: Story = {
  render: (args) => <IconPicker {...args} />,
};

export const NotionIcons: Story = {
  render: () => {
    const emoji = useEmojiFactory();
    const lucide = useLucideFactory();
    const notion = useNotionIconsFactory();

    return <IconPicker factories={[emoji, lucide, notion]} />;
  },
};
