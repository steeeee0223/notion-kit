"use client";

import { useState } from "react";

import { SelectPreset, type SelectPresetProps } from "@notion-kit/shadcn";

const Option: SelectPresetProps["renderOption"] = ({ option }) => (
  <div className="truncate text-secondary">
    {typeof option === "string" ? option : option?.label}
  </div>
);

export default function Custom() {
  const options = {
    on: { label: "On", description: "Turn on notification" },
    off: { label: "Off", description: "Turn on notification" },
  };
  const [value, setValue] = useState<keyof typeof options>("on");

  return (
    <SelectPreset
      className="w-fit"
      options={options}
      value={value}
      onChange={setValue}
      renderOption={Option}
    />
  );
}
