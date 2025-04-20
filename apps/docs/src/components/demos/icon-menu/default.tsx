"use client";

import { useState } from "react";

import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";

const defaultIcon: IconData = { type: "text", src: "S" };

export default function Default() {
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
}
