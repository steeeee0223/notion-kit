import React from "react";
import { Shuffle } from "lucide-react";

import { AutocompleteInput, Button, TooltipPreset } from "@/primitives";

interface MenuSearchBarProps {
  onRandomSelect: () => void;
  onSearchClear: () => void;
  Palette: React.ReactNode;
}

export function MenuSearchBar({
  onRandomSelect,
  onSearchClear,
  Palette,
}: MenuSearchBarProps) {
  return (
    <div className="flex w-full items-center gap-x-1.5">
      <AutocompleteInput
        search
        clear
        onCancel={onSearchClear}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="Filter..."
        classNames={{ wrapper: "flex-1 p-0" }}
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
