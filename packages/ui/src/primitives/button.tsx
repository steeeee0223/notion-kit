import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { buttonVariants, type ButtonVariants } from "./variants";

export interface ButtonProps
  extends useRender.ComponentProps<"button">, ButtonVariants {}

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

function CloseButton() {
  return (
    <Button type="button" variant="close" size="circle" aria-label="Close">
      <Icon.Close className="h-full w-3.5 fill-secondary dark:fill-default/45" />
      <span className="sr-only">Close</span>
    </Button>
  );
}

export { Button, CloseButton };
