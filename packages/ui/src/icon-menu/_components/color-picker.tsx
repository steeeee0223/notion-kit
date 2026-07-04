import { useState } from "react";
import { Circle } from "lucide-react";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
  TooltipProvider,
} from "@/primitives";

import type { PaletteProps } from "./types";

type ColorPickerProps = PaletteProps<Record<string, string>>;

export function ColorPicker({ palette, value, onSelect }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const selectColor = (color: string) => {
    setOpen(false);
    onSelect(color);
  };

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipPreset description="Select icon color">
          <PopoverTrigger
            render={
              <Button variant="icon" className="size-7">
                <Circle size={16} color={value} fill={value} />
              </Button>
            }
          />
        </TooltipPreset>
        <PopoverContent className="z-1000 grid w-45 grid-cols-5 gap-0 p-2">
          {Object.entries(palette).map(([name, color]) => (
            <TooltipPreset key={name} description={name} className="z-1001">
              <Button
                variant="hint"
                className="size-[30px] p-0"
                onClick={() => selectColor(color)}
              >
                <Circle color={color} fill={color} size={16} />
              </Button>
            </TooltipPreset>
          ))}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
