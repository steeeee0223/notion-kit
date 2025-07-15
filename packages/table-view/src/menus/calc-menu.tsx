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

import { CountMethod, type PropertyType } from "../lib/types";
import { useTableActions } from "../table-contexts";
import { countMethodHint } from "./constants";

interface CalcMenuProps {
  id: string; // column id
  type: PropertyType;
  countMethod: CountMethod;
  isCountCapped?: boolean;
}

export function CalcMenu({
  id,
  type,
  countMethod,
  isCountCapped,
}: CalcMenuProps) {
  const { updateColumn, toggleCountCap } = useTableActions();

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
        checked={countMethod === CountMethod.NONE}
        onCheckedChange={() =>
          updateColumn(id, { countMethod: CountMethod.NONE })
        }
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
              onSelect={() => toggleCountCap(id)}
            >
              <MenuItemAction>
                <Switch size="sm" checked={isCountCapped} />
              </MenuItemAction>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {countMethods.map((method) => (
              <HintItem
                key={method}
                {...countMethodHint[method]}
                checked={countMethod === method}
                onCheckedChange={() =>
                  updateColumn(id, { countMethod: method })
                }
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
                checked={countMethod === method}
                onCheckedChange={() =>
                  updateColumn(id, { countMethod: method })
                }
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
      className="w-[156px]"
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
