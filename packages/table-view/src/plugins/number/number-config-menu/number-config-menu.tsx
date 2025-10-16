"use client";

import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@notion-kit/shadcn";

import { MenuGroupHeader } from "../../../common";
import { useTableViewCtx } from "../../../table-contexts";
import type { ConfigMenuProps } from "../../types";
import { DEFAULT_CONFIG } from "../constant";
import type { NumberConfig } from "../types";
import { DisplayTypeSelect } from "./display-type-select";
import { FormatMenu } from "./format-menu";
import { OptionSettings } from "./option-settings";
import { RoundingMenu } from "./rounding-menu";

export function NumberConfigMenu({
  propId,
  config = DEFAULT_CONFIG,
}: ConfigMenuProps<NumberConfig>) {
  const { table } = useTableViewCtx();
  const [configDraft, setConfigDraft] = useState<NumberConfig>(config);
  const updateConfig = () =>
    table._setColumnInfo(propId, (prev) => ({
      ...prev,
      config: configDraft,
    }));

  return (
    <DropdownMenuSub
      onOpenChange={(open) => {
        if (open) return;
        updateConfig();
      }}
    >
      <DropdownMenuSubTrigger Icon={<Icon.Sliders />} Body="Edit property" />
      <DropdownMenuSubContent className="w-[250px]">
        <DropdownMenuGroup>
          <FormatMenu
            format={configDraft.format}
            onUpdate={(format) => setConfigDraft((v) => ({ ...v, format }))}
          />
          <RoundingMenu
            round={configDraft.round}
            onUpdate={(round) => setConfigDraft((v) => ({ ...v, round }))}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <MenuGroupHeader title="Show as" />
          {/* buttons for display type */}
          <DisplayTypeSelect
            type={configDraft.showAs}
            onUpdate={(showAs) => setConfigDraft((v) => ({ ...v, showAs }))}
          />
          {/* settings */}
          <OptionSettings
            options={configDraft.options}
            onUpdate={(options) =>
              setConfigDraft((v) => ({
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
