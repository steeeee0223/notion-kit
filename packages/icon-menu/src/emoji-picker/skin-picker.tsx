"use client";

import React, { useState } from "react";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

import type { PaletteProps } from "../_components";
import type { Skin } from "./types";

type SkinPickerProps = PaletteProps<
  Record<Skin, { emoji: string; name: string }>
>;

export const SkinPicker: React.FC<SkinPickerProps> = ({
  palette,
  value,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const selectSkin = (skin: Skin) => {
    setOpen(false);
    onSelect(skin);
  };

  return (
    <TooltipProvider delayDuration={500}>
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipPreset description="Select skin tone">
          <PopoverTrigger asChild>
            <Button variant="hint" className="size-7 text-xl/6 text-primary">
              {palette[value].emoji}
            </Button>
          </PopoverTrigger>
        </TooltipPreset>
        <PopoverContent className="grid w-[200px] grid-cols-6 gap-0 p-1">
          {Object.entries(palette).map(([id, { emoji, name }]) => (
            <TooltipPreset key={id} sideOffset={8} description={name}>
              <Button
                variant="hint"
                className="size-8 p-0 text-2xl text-primary"
                onClick={() => selectSkin(id as Skin)}
              >
                {emoji}
              </Button>
            </TooltipPreset>
          ))}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

SkinPicker.displayName = "SkinPicker";
