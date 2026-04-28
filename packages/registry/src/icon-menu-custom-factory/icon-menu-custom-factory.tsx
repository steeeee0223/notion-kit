"use client";

import { useState } from "react";

import { IconBlock, type IconData } from "@notion-kit/icon-block";
import {
  IconMenu,
  useCustomFactory,
  useEmojiFactory,
} from "@notion-kit/icon-menu";

const defaultIcon: IconData = { type: "text", src: "S" };
const iconsData = [
  {
    id: "github",
    name: "GitHub",
    url: "https://cdn.simpleicons.org/github/white",
    keywords: ["git", "code", "repo"],
  },
  {
    id: "slack",
    name: "Slack",
    url: "https://cdn.simpleicons.org/slack",
    keywords: ["chat", "messaging"],
  },
  {
    id: "figma",
    name: "Figma",
    url: "https://cdn.simpleicons.org/figma",
    keywords: ["design", "ui"],
  },
  {
    id: "notion",
    name: "Notion",
    url: "https://cdn.simpleicons.org/notion/white",
    keywords: ["wiki", "docs"],
  },
  {
    id: "linear",
    name: "Linear",
    url: "https://cdn.simpleicons.org/linear",
    keywords: ["project", "issues"],
  },
];

export default function CustomFactory() {
  const [icon, setIcon] = useState<IconData>(defaultIcon);

  const emoji = useEmojiFactory();
  const brands = useCustomFactory({
    id: "brands",
    label: "Brands",
    icons: iconsData,
  });

  return (
    <IconMenu
      factories={[emoji, brands]}
      onSelect={setIcon}
      onRemove={() => setIcon(defaultIcon)}
    >
      <IconBlock icon={icon} size="lg" />
    </IconMenu>
  );
}
