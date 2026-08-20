import type { OnChangeFn } from "@tanstack/react-table";

import type { SelectConfig } from "@notion-kit/table-hook/plugins";

import { SelectMenu } from "./select-menu";
import { useSelectMenu } from "./select-menu/use-select-menu";

interface BulkSelectEditorProps {
  multi?: boolean;
  propId: string;
  config: SelectConfig;
  value: string[];
  onUpdate: (value: string[]) => void;
  onConfigChange?: OnChangeFn<SelectConfig>;
}

export function BulkSelectEditor({
  multi,
  propId,
  config,
  value,
  onUpdate,
  onConfigChange,
}: BulkSelectEditorProps) {
  const menu = useSelectMenu({
    multi,
    propId,
    config,
    options: value,
    onChange: onUpdate,
    onConfigChange,
  });

  return <SelectMenu menu={menu} />;
}
