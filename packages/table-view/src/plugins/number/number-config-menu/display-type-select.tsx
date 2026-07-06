import { cn } from "@notion-kit/cn";
import { Button, MeterBar, MeterRing } from "@notion-kit/ui/primitives";
import { COLOR } from "@notion-kit/utils";

import type { NumberDisplayType } from "../types";

interface DisplayTypeSelectProps {
  type: NumberDisplayType;
  onUpdate: (type: NumberDisplayType) => void;
}

export function DisplayTypeSelect({ type, onUpdate }: DisplayTypeSelectProps) {
  return (
    <div className="mx-2.5 mt-1.5 flex items-center justify-between gap-1.5">
      <Button
        tabIndex={0}
        className={cn(
          "flex h-13 flex-[1_1_0] flex-col px-3 text-secondary",
          "aria-selected:border-2 aria-selected:border-blue aria-selected:text-blue",
        )}
        aria-selected={type === "number"}
        onClick={() => onUpdate("number")}
      >
        <div className="mb-1 flex h-5 w-full items-center justify-center">
          <div className="text-base font-medium">42</div>
        </div>
        <div className="text-xs/none">Number</div>
      </Button>
      <Button
        tabIndex={0}
        className={cn(
          "flex h-13 flex-[1_1_0] flex-col px-3 text-secondary",
          "aria-selected:border-2 aria-selected:border-blue aria-selected:text-blue",
        )}
        aria-selected={type === "bar"}
        onClick={() => onUpdate("bar")}
      >
        <div className="mb-1 flex h-5 w-full items-center justify-center">
          <MeterBar value={50} trackColor={COLOR.blue.hex} />
        </div>
        <div className="text-xs/none">Bar</div>
      </Button>
      <Button
        tabIndex={0}
        className={cn(
          "flex h-13 flex-[1_1_0] flex-col px-3 text-secondary",
          "aria-selected:border-2 aria-selected:border-blue aria-selected:text-blue",
        )}
        aria-selected={type === "ring"}
        onClick={() => onUpdate("ring")}
      >
        <div className="mb-1 flex h-5 w-full items-center justify-center">
          <MeterRing value={40} trackColor={COLOR.blue.hex} />
        </div>
        <div className="text-xs/none">Ring</div>
      </Button>
    </div>
  );
}
