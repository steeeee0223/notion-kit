"use client";

import { useState } from "react";

import { MultiSelect, type MultiSelectOption } from "@notion-kit/shadcn";

const OPTIONS: MultiSelectOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "Solid" },
];

export default function Default() {
  const [value, setValue] = useState<MultiSelectOption[]>([]);

  return (
    <MultiSelect
      value={value}
      defaultOptions={OPTIONS}
      onChange={setValue}
      placeholder="Select frameworks..."
    />
  );
}
