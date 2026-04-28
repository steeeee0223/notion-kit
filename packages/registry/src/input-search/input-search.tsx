"use client";

import { useState } from "react";

import { Input } from "@notion-kit/shadcn";

export default function Search() {
  const [value, setValue] = useState("");
  return (
    <Input
      className="w-80"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onCancel={() => setValue("")}
      placeholder="Enter something..."
      search
      clear
    />
  );
}
