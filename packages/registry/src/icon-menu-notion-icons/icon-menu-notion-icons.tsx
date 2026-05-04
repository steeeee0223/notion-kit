"use client";

import { useState } from "react";

import { IconBlock, type IconData } from "@notion-kit/ui/icon-block";
import {
  IconMenu,
  useEmojiFactory,
  useLucideFactory,
  useNotionIconsFactory,
} from "@notion-kit/ui/icon-menu";

const defaultIcon: IconData = { type: "text", src: "S" };

export default function NotionIcons() {
  const [icon, setIcon] = useState<IconData>(defaultIcon);

  const emoji = useEmojiFactory();
  const lucide = useLucideFactory();
  const notion = useNotionIconsFactory();

  return (
    <IconMenu
      factories={[emoji, lucide, notion]}
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
