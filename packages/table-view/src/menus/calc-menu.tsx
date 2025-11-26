"use client";

import { useMemo } from "react";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  MenuItemAction,
  Switch,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { CountMethod } from "../features";
import { type PluginType } from "../lib/types";
import type { CellPlugin } from "../plugins";
import { useTableViewCtx } from "../table-contexts";
import { countMethodHint } from "./constants";

interface CalcMenuProps {
  id: string; // column id
  type: PluginType<CellPlugin[]>;
}

export function CalcMenu({ id, type }: CalcMenuProps) {
  const { table } = useTableViewCtx();
  const counting = table.getColumnCounting(id);

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
        Body="None"
        checked={counting.method === CountMethod.NONE}
        onCheckedChange={() => table.setColumnCountMethod(id, CountMethod.NONE)}
      />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger Body="Count" />
        <DropdownMenuSubContent className="w-[250px]">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="gap-2 p-2"
              Body={
                <>
                  <div>Show large counts as 99+</div>
                  <div className="mt-1.5 overflow-hidden text-xs overflow-ellipsis whitespace-normal text-muted">
                    This improves performance for large databases.
                  </div>
                </>
              }
              onSelect={() => table.setColumnCountCapped(id, (v) => !v)}
            >
              <MenuItemAction>
                <Switch size="sm" checked={counting.isCapped} />
              </MenuItemAction>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {countMethods.map((method) => (
              <HintItem
                key={method}
                {...countMethodHint[method]}
                checked={counting.method === method}
                onCheckedChange={() => table.setColumnCountMethod(id, method)}
              />
            ))}
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger Body="Percent" />
        <DropdownMenuSubContent className="w-[250px]">
          <DropdownMenuGroup>
            {percentMethods.map((method) => (
              <HintItem
                key={method}
                {...countMethodHint[method]}
                checked={counting.method === method}
                onCheckedChange={() => table.setColumnCountMethod(id, method)}
              />
            ))}
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
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
      className="z-990 w-[156px]"
      side="right"
      description={[
        { type: "image", text: imgSrc },
        { type: "default", text: desc },
      ]}
    >
      <DropdownMenuCheckboxItem Body={title} {...props} />
    </TooltipPreset>
  );
}
