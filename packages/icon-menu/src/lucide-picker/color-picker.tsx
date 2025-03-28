"use client";

import React, { useState } from "react";
import { Circle } from "lucide-react";

import { Hint, HintProvider } from "@notion-kit/common";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/shadcn";

import type { PaletteProps } from "../_components";

type ColorPickerProps = PaletteProps<
  Record<string, string> & { default: string }
>;

export const ColorPicker: React.FC<ColorPickerProps> = ({
  palette,
  value,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const selectColor = (color: string) => {
    setOpen(false);
    onSelect(color);
  };

  return (
    <HintProvider delayDuration={500}>
      <Popover open={open} onOpenChange={setOpen}>
        <Hint description="Select icon color">
          <PopoverTrigger asChild>
            <Button variant="icon" className="size-7">
              <Circle size={16} color={value} fill={value} />
            </Button>
          </PopoverTrigger>
        </Hint>
        <PopoverContent className="grid w-[180px] grid-cols-5 gap-0 p-2">
          {Object.entries(palette).map(([name, color]) => (
            <Hint key={name} description={name}>
              <Button
                variant="hint"
                className="size-[30px] p-0"
                onClick={() => selectColor(color)}
              >
                <Circle color={color} fill={color} size={16} />
              </Button>
            </Hint>
          ))}
        </PopoverContent>
      </Popover>
    </HintProvider>
  );
};

ColorPicker.displayName = "ColorPicker";
