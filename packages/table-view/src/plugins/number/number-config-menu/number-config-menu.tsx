"use client";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@notion-kit/shadcn";

import { MenuGroupHeader } from "../../../common";
import type { ConfigMenuProps } from "../../types";
import { DEFAULT_CONFIG } from "../constant";
import type { NumberConfig } from "../types";
import { DisplayTypeSelect } from "./display-type-select";
import { FormatMenu } from "./format-menu";
import { OptionSettings } from "./option-settings";
import { RoundingMenu } from "./rounding-menu";

export function NumberConfigMenu({
  config = DEFAULT_CONFIG,
  onChange,
  onOpenChange,
}: ConfigMenuProps<NumberConfig>) {
  return (
    <DropdownMenuSub onOpenChange={onOpenChange}>
      <DropdownMenuSubTrigger Icon={<Icon.Sliders />} Body="Edit property" />
      <DropdownMenuSubContent className="w-[250px]">
        <DropdownMenuGroup>
          <FormatMenu
            format={config.format}
            onUpdate={(format) => onChange?.((v) => ({ ...v, format }))}
          />
          <RoundingMenu
            round={config.round}
            onUpdate={(round) => onChange?.((v) => ({ ...v, round }))}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <MenuGroupHeader title="Show as" />
          {/* buttons for display type */}
          <DisplayTypeSelect
            type={config.showAs}
            onUpdate={(showAs) => onChange?.((v) => ({ ...v, showAs }))}
          />
          {/* settings */}
          <OptionSettings
            options={config.options}
            onUpdate={(options) =>
              onChange?.((v) => ({
                ...v,
                options: { ...v.options, ...options },
              }))
            }
          />
          {/* footer desc. */}
          <div className="mx-2.5 mt-3 pb-1 text-xs text-muted">
            Changes apply to all views showing this property.
          </div>
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
