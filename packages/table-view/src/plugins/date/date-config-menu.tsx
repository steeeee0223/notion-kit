import { Icon } from "@notion-kit/icons";
import type {
  ConfigMenuProps,
  DateConfig,
} from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@notion-kit/ui/primitives";

import { DateFormatMenu, TimeFormatMenu } from "./common";

export function DateConfigMenu({
  config,
  onChange,
}: ConfigMenuProps<DateConfig>) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger icon={<Icon.Sliders />} label="Edit property" />
      <DropdownMenuContent sideOffset={-4} className="w-75">
        <DropdownMenuGroup>
          <DateFormatMenu
            showIcon
            format={config.dateFormat}
            onChange={(dateFormat) => onChange({ ...config, dateFormat })}
          />
          <TimeFormatMenu
            showIcon
            format={config.timeFormat}
            onChange={(timeFormat) => onChange({ ...config, timeFormat })}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}
