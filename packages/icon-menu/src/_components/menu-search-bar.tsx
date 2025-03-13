import React from "react";
import { Shuffle } from "lucide-react";

import { Hint } from "@notion-kit/common";
import { Button, Input } from "@notion-kit/shadcn";

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
      <Hint description="Random">
        <Button variant="secondary" size="icon-md" onClick={onRandomSelect}>
          <Shuffle size={16} />
        </Button>
      </Hint>
      {Palette}
    </div>
  );
};
