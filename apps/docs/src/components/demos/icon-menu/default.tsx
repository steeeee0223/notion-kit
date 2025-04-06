"use client";

import { useState } from "react";

import { IconBlock, type IconInfo } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";

const defaultIcon: IconInfo = { type: "text", text: "S" };

export default function Default() {
  const [icon, setIcon] = useState<IconInfo>(defaultIcon);

  return (
    <IconMenu
      onSelect={setIcon}
      onRemove={() => setIcon(defaultIcon)}
      onUpload={(file) =>
        setIcon({
          type: "file",
          url: URL.createObjectURL(file),
        })
      }
    >
      <IconBlock icon={icon} size="lg" />
    </IconMenu>
  );
}
