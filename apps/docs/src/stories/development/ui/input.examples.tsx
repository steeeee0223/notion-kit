import { useState } from "react";
import type { ComponentProps } from "react";

import { Input } from "@notion-kit/ui/primitives";

interface WithClearProps {
  clear?: ComponentProps<typeof Input>["clear"];
  placeholder?: ComponentProps<typeof Input>["placeholder"];
}
export function WithClearExample(overrides: WithClearProps) {
  const props = {
    clear: true,
    placeholder: "Search a website",
    ...overrides,
  } satisfies Partial<ComponentProps<typeof Input>>;

  const [value, setValue] = useState("");
  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onCancel={() => setValue("")}
    />
  );
}
