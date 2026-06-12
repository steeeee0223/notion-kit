"use client";

import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

const options = [
  {
    value: "on",
    icon: <Icon.ArrowUp />,
    label: "Ascending",
    description: "Sort ascending",
  },
  {
    value: "off",
    icon: <Icon.ArrowDown />,
    label: "Descending",
    description: "Sort descending",
  },
] as const;

export default function Custom() {
  const [value, setValue] = useState<(typeof options)[number]["value"]>("on");
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Select
      items={options}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) setValue(nextValue);
      }}
    >
      <SelectTrigger className="w-fit">
        <SelectValue aria-label={selectedOption?.label}>
          <div className="truncate text-secondary">{selectedOption?.label}</div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              label={option.label}
              icon={option.icon}
              desc={option.description}
            />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
