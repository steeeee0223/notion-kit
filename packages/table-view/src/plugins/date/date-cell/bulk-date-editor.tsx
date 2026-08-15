import { functionalUpdate } from "@tanstack/react-table";

import type { DateConfig, DateData } from "@notion-kit/table-hook/plugins";

import { DateTimePicker } from "./date-time-picker";

interface BulkDateEditorProps {
  data: DateData;
  config: DateConfig;
  onUpdate: (value: DateData) => void;
  onConfigChange?: (
    updater: DateConfig | ((value: DateConfig) => DateConfig),
  ) => void;
}

export function BulkDateEditor({
  data,
  config,
  onUpdate,
  onConfigChange,
}: BulkDateEditorProps) {
  return (
    <DateTimePicker
      data={data}
      config={config}
      onChange={(updater) => onUpdate(functionalUpdate(updater, data))}
      onConfigChange={onConfigChange}
    />
  );
}
