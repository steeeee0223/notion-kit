import { useMemo } from "react";

import { CountMethod, type PluginType } from "@notion-kit/table-hook";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import type { CellPlugin } from "@/plugins";
import { useTableViewCtx } from "@/table-contexts";

import { countMethodHint } from "./constants";

interface CalcMenuProps {
  id: string; // column id
  type: PluginType<CellPlugin[]>;
}

export function CalcMenu({ id, type }: CalcMenuProps) {
  const { table } = useTableViewCtx();
  const counting = table.getColumnCounting(id);
  const currentMethod = counting.method as CountMethod;

  const { countMethods, percentMethods } = useMemo(() => {
    const countMethods = [
      CountMethod.ALL,
      ...(type === "checkbox"
        ? [CountMethod.CHECKED, CountMethod.UNCHECKED]
        : [
            CountMethod.VALUES,
            CountMethod.UNIQUE,
            CountMethod.EMPTY,
            CountMethod.NONEMPTY,
          ]),
    ];

    const percentMethods =
      type === "checkbox"
        ? [CountMethod.PERCENTAGE_CHECKED, CountMethod.PERCENTAGE_UNCHECKED]
        : [CountMethod.PERCENTAGE_EMPTY, CountMethod.PERCENTAGE_NONEMPTY];
    return { countMethods, percentMethods };
  }, [type]);

  return (
    <DropdownMenuGroup>
      <DropdownMenuCheckboxItem
        label="None"
        checked={currentMethod === CountMethod.NONE}
        onCheckedChange={() => table.setColumnCountMethod(id, CountMethod.NONE)}
      />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger label="Count" />
        <DropdownMenuContent sideOffset={-4} className="w-[250px]">
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checkType="switch"
              label="Show large counts as 99+"
              desc="This improves performance for large databases."
              checked={counting.isCapped}
              onCheckedChange={() => table.setColumnCountCapped(id, (v) => !v)}
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {countMethods.map((method) => (
              <HintItem
                key={method}
                {...countMethodHint[method]}
                checked={currentMethod === method}
                onCheckedChange={() => table.setColumnCountMethod(id, method)}
              />
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger label="Percent" />
        <DropdownMenuContent sideOffset={-4} className="w-[250px]">
          <DropdownMenuGroup>
            {percentMethods.map((method) => (
              <HintItem
                key={method}
                {...countMethodHint[method]}
                checked={currentMethod === method}
                onCheckedChange={() => table.setColumnCountMethod(id, method)}
              />
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  );
}

interface HintItemProps {
  title: string;
  desc: string;
  imgSrc: string;
  checked: boolean;
  onCheckedChange: () => void;
}

function HintItem({ title, desc, imgSrc, ...props }: HintItemProps) {
  return (
    <TooltipPreset
      className="w-[156px]"
      side="right"
      description={
        <>
          <TooltipDescription type="image" text={imgSrc} />
          <TooltipDescription text={desc} />
        </>
      }
    >
      <DropdownMenuCheckboxItem {...props} label={title} />
    </TooltipPreset>
  );
}
