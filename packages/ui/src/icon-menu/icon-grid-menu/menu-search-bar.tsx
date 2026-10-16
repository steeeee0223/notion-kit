import React from "react";
import { Shuffle } from "lucide-react";

import { AutocompleteInput, Button, TooltipPreset } from "@/primitives";

interface MenuSearchBarProps {
  onRandomSelect: () => void;
  Palette: React.ReactNode;
}

export function MenuSearchBar({ onRandomSelect, Palette }: MenuSearchBarProps) {
  return (
    <div className="flex w-full items-center gap-x-1.5">
      <AutocompleteInput
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="Filter..."
      />
      <TooltipPreset description="Random">
        <Button variant="icon" className="size-7" onClick={onRandomSelect}>
          <Shuffle size={16} />
        </Button>
      </TooltipPreset>
      {Palette}
    </div>
  );
}
