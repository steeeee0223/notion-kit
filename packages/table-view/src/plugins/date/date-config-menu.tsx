import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@notion-kit/shadcn";

import type { ConfigMenuProps } from "../types";
import { DateFormatMenu, TimeFormatMenu } from "./common";
import type { DateConfig } from "./types";

export function DateConfigMenu({
  config,
  onChange,
}: ConfigMenuProps<DateConfig>) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger Icon={<Icon.Sliders />} Body="Edit property" />
      <DropdownMenuSubContent className="w-75">
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
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
