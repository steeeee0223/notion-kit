"use client";

import { useState } from "react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

export default function Demo() {
  const [position, setPosition] = useState("top");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm">Open</Button>} />
      <DropdownMenuContent className="w-32">
        <DropdownMenuRadioGroup
          value={position}
          onValueChange={(value: string) => setPosition(value)}
        >
          <DropdownMenuLabel title="Position" />
          <DropdownMenuRadioItem value="top" label="Top" />
          <DropdownMenuRadioItem value="bottom" label="Bottom" />
          <DropdownMenuRadioItem value="right" label="Right" />
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
