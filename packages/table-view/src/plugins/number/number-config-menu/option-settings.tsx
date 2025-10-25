import { Input, SelectPreset, Switch } from "@notion-kit/shadcn";
import { COLOR_OPTIONS } from "@notion-kit/utils";

import type { NumberOptions } from "../types";

interface OptionSettingsProps {
  options: NumberOptions;
  onUpdate: (options: Partial<NumberOptions>) => void;
}

export function OptionSettings({ options, onUpdate }: OptionSettingsProps) {
  return (
    <div className="mx-2.5 mt-3 flex flex-col items-center gap-2 overflow-hidden rounded-sm bg-default/5 py-3">
      <div className="flex h-7 w-full items-center gap-4 px-4">
        <div className="flex-[6_1_0] text-sm">Color</div>
        <div className="flex flex-[6_1_0] flex-wrap gap-2">
          <div className="flex w-full justify-end">
            <SelectPreset
              options={COLOR_OPTIONS}
              value={options.color}
              onChange={(color) => onUpdate({ color })}
            />
          </div>
        </div>
      </div>
      <div className="flex h-7 w-full items-center gap-4 px-4">
        <div className="flex-[6_1_0] text-sm">Divide by</div>
        <div className="flex-[6_1_0]">
          <Input
            defaultValue={options.divideBy}
            onBlur={(e) => onUpdate({ divideBy: e.target.valueAsNumber })}
          />
        </div>
      </div>
      <div className="flex h-7 w-full items-center gap-4 px-4">
        <div className="flex-[6_1_0] text-sm">Show number</div>
        <div className="flex flex-[6_1_0] justify-end">
          <Switch
            checked={options.showNumber}
            onCheckedChange={(showNumber) => onUpdate({ showNumber })}
          />
        </div>
      </div>
    </div>
  );
}
