import { Icon } from "@notion-kit/icons";
import type { NumberConfig } from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

import type { ConfigMenuRendererProps } from "@/plugins/renderers";

import { DisplayTypeSelect } from "./display-type-select";
import { FormatMenu } from "./format-menu";
import { OptionSettings } from "./option-settings";
import { RoundingMenu } from "./rounding-menu";

export function NumberConfigMenu({
  config,
  onChange,
}: ConfigMenuRendererProps<NumberConfig>) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger icon={<Icon.Sliders />} label="Edit property" />
      <DropdownMenuContent sideOffset={-4} className="w-75">
        <DropdownMenuGroup>
          <FormatMenu
            format={config.format}
            onUpdate={(format) => onChange((v) => ({ ...v, format }))}
          />
          <RoundingMenu
            round={config.round}
            onUpdate={(round) => onChange((v) => ({ ...v, round }))}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel title="Show as" />
          {/* buttons for display type */}
          <DisplayTypeSelect
            type={config.showAs}
            onUpdate={(showAs) => onChange((v) => ({ ...v, showAs }))}
          />
          {/* settings */}
          {config.showAs !== "number" && (
            <OptionSettings
              options={config.options}
              onUpdate={(options) =>
                onChange((v) => ({
                  ...v,
                  options: { ...v.options, ...options },
                }))
              }
            />
          )}
          {/* footer desc. */}
          <div className="mx-2.5 mt-3 pb-1 text-xs text-muted">
            Changes apply to all views showing this property.
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}
