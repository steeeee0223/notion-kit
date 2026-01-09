import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Cover } from "@notion-kit/cover";

const meta = {
  title: "blocks/Cover",
  component: Cover,
} satisfies Meta<typeof Cover>;
export default meta;

type Story = StoryObj<typeof meta>;

const NOTION_IMAGE =
  "https://www.notion.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fspoqsaf9291f%2F5RcoNncfzeuqS7V5qqelRJ%2F81e4b42053f8937bbbdb4842f0fcdc72%2Fdocs-hero.png&w=3840&q=75";

const Template: Story["render"] = (props) => {
  const [cover, setCover] = useState(props.url);

  return (
    <Cover
      url={cover}
      unsplashAPIKey={props.unsplashAPIKey}
      onSelect={setCover}
      onUpload={(file) => setCover(URL.createObjectURL(file))}
      onRemove={() => setCover(NOTION_IMAGE)}
    />
  );
};

export const Default: Story = {
  args: {
    url: NOTION_IMAGE,
    unsplashAPIKey: "UNSPLASH_ACCESS_KEY",
  },
  render: Template,
};
