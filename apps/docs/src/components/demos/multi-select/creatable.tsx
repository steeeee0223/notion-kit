"use client";

import { useState } from "react";

import { MultiSelect, type MultiSelectOption } from "@notion-kit/shadcn";

const OPTIONS: MultiSelectOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

export default function Creatable() {
  const [value, setValue] = useState<MultiSelectOption[]>([]);
  const [options, setOptions] = useState(OPTIONS);

  return (
    <MultiSelect
      value={value}
      defaultOptions={options}
      onChange={(selected) => {
        setValue(selected);
        // Add any newly created options to the list
        const newOptions = selected.filter(
          (s) => !options.some((o) => o.value === s.value),
        );
        if (newOptions.length > 0) setOptions([...options, ...newOptions]);
      }}
      creatable
      placeholder="Type to create..."
    />
  );
}
