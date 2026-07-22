import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { cn, cva, type VariantProps } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

const checkboxVariants = cva(
  [
    "peer relative flex shrink-0 items-center justify-center border border-border-button shadow-xs transition-colors outline-none hover:bg-default/5",
    "after:absolute after:-inset-x-3 after:-inset-y-2",
    "focus-visible:shadow-notion",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-checked:border-none data-checked:bg-blue",
    "data-indeterminate:border-none data-indeterminate:bg-blue",
  ],
  {
    variants: {
      size: {
        md: "size-4",
        sm: "size-3.5",
        xs: "size-[13px] rounded-xs",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface CheckboxProps
  extends CheckboxPrimitive.Root.Props, VariantProps<typeof checkboxVariants> {}

function Checkbox({ className, size, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ size, className }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        render={(_props, state) => {
          return (
            <span className="grid place-content-center transition-none [&>svg]:size-3.5 [&>svg]:fill-white">
              {state.indeterminate ? (
                <Icon.DashFillSmall />
              ) : state.checked ? (
                <Icon.Check />
              ) : null}
            </span>
          );
        }}
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
