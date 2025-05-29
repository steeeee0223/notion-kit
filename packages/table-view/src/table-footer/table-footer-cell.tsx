"use client";

import { useMemo } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuItemAction,
  Switch,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { CountMethod, type PropertyType } from "../lib/types";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import { footerHint } from "./constants";

interface TableFooterCellProps {
  id: string; // column id
  type: PropertyType;
  countMethod: CountMethod;
  isCountCapped?: boolean;
  width?: string;
}

export function TableFooterCell({
  id,
  type,
  countMethod,
  isCountCapped,
  width,
}: TableFooterCellProps) {
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
    <div className="flex" style={{ width }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            tabIndex={0}
            variant="cell"
            className="h-8 w-full justify-end overflow-hidden pr-2 select-auto"
          >
            <CountDisplay id={id} type={type} countMethod={countMethod} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50" align="start" alignOffset={-4}>
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
                      {...footerHint[method]}
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
                      {...footerHint[method]}
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface CountDisplayProps {
  id: string;
  type: PropertyType;
  countMethod: CountMethod;
}

function CountDisplay({ id, type, countMethod }: CountDisplayProps) {
  const { getColumnCount } = useTableViewCtx();

  return countMethod === CountMethod.NONE ? (
    <div className="flex items-center opacity-100 transition-opacity duration-200">
      <div className="flex items-center">
        <span className="text-muted">
          {type === "checkbox" ? "∑" : "Calculate"}
        </span>
        <Icon.ChevronDown className="mt-px ml-1 block size-2.5 shrink-0 fill-muted" />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-1">
      <span className="mt-0.5 text-[10px] tracking-[1px] text-muted uppercase select-none">
        {footerHint[countMethod].label}
      </span>
      <span className="flex h-full items-center">
        {getColumnCount(id, countMethod)}
      </span>
    </div>
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
