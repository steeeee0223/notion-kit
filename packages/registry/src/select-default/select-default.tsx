"use client";

import { useState } from "react";

import { SelectPreset as Select } from "@notion-kit/ui/primitives";

export default function Default() {
  const options = { light: "Light", dark: "Dark" };
  const [value, setValue] = useState("light");

  return (
    <Select
      className="w-fit"
      options={options}
      value={value}
      onChange={setValue}
    />
  );
}
