import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@notion-kit/cn";

import { buttonVariants, type ButtonVariants } from "./variants";

export interface ButtonProps
  extends useRender.ComponentProps<"button">,
    ButtonVariants {}

function Button({ className, variant, size, render, ...props }: ButtonProps) {
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps(
      {
        "data-slot": "button",
        className: cn(buttonVariants({ variant, size, className })),
      },
      props,
    ),
  });
}

export { Button };
