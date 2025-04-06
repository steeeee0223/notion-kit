"use client";

import { useState } from "react";

import { Select } from "@notion-kit/select";

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
