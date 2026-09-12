import { useId } from "react";

import { Icon } from "@notion-kit/icons";
import type { TitleConfig } from "@notion-kit/table-hook/plugins";
import {
  DropdownMenuItem,
  Label,
  MenuItemAction,
  Switch,
} from "@notion-kit/ui/primitives";

import type { ConfigMenuRendererProps } from "@/plugins/renderers";

export function TitleConfig({
  config,
  onChange,
}: ConfigMenuRendererProps<TitleConfig>) {
  const id = useId();

  return (
    <Label htmlFor={id}>
      <DropdownMenuItem icon={<Icon.EmojiFace />} label="Show page icon">
        <MenuItemAction className="flex items-center">
          <Switch
            id={id}
            size="sm"
            checked={config.showIcon}
            onCheckedChange={(showIcon) =>
              onChange((v) => ({ ...v, showIcon }))
            }
          />
        </MenuItemAction>
      </DropdownMenuItem>
    </Label>
  );
}
