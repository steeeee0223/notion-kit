import React from "react";
import { Shuffle } from "lucide-react";

import {
  Button,
  Input,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

interface MenuSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRandomSelect: () => void;
  Palette: React.ReactNode;
}

export const MenuSearchBar: React.FC<MenuSearchBarProps> = ({
  search,
  onSearchChange,
  onRandomSelect,
  Palette,
}) => {
  return (
    <TooltipProvider delayDuration={500}>
      <div className="mb-1.5 flex w-full items-center gap-x-1.5">
        <div className="flex-1">
          <Input
            search
            clear
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onCancel={() => onSearchChange("")}
            placeholder="Filter..."
          />
        </div>
        <TooltipPreset description="Random">
          <Button variant="icon" className="size-7" onClick={onRandomSelect}>
            <Shuffle size={16} />
          </Button>
        </TooltipPreset>
        {Palette}
      </div>
    </TooltipProvider>
  );
};
