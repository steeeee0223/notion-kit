import { mergeProps, useRender } from "@base-ui/react";

import { cn } from "@notion-kit/cn";

import { typography } from "./variants";

function Label({
  ref,
  render,
  className,
  ...props
}: useRender.ComponentProps<"label">) {
  return useRender({
    defaultTagName: "label",
    ref,
    render,
    props: mergeProps(
      {
        "data-slot": "label",
        className: cn(
          typography("label"),
          "text-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        ),
      },
      props,
    ),
  });
}

export { Label };
