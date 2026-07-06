import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn, cva, type VariantProps } from "@notion-kit/cn";

const switchVariants = cva(
  [
    "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-none p-0.5 transition-all outline-none",
    "focus-visible:shadow-notion disabled:cursor-not-allowed disabled:opacity-50",
    "data-checked:bg-blue data-unchecked:bg-default/15",
  ],
  {
    variants: {
      size: {
        md: "h-6 w-11 *:data-[slot='switch-thumb']:size-5",
        sm: "h-4 w-7 *:data-[slot='switch-thumb']:size-3",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type SwitchProps = SwitchPrimitive.Root.Props &
  VariantProps<typeof switchVariants>;

function Switch({ className, size, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ className, size }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-checked:translate-x-full data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
