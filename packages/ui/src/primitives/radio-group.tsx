"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@notion-kit/cn";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-[18px] shrink-0 cursor-pointer rounded-full border border-border bg-main shadow-[0_0_0_1.5px_var(--c-borStr)] transition-[background,box-shadow] duration-100 ease-out outline-none",
        "focus-visible:shadow-notion disabled:cursor-not-allowed",
        "data-[state=checked]:border-none data-[state=checked]:bg-blue data-[state=checked]:shadow-[0_0_0_1.5px_var(--c-bluBacAccPri)]",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="grid size-full place-items-center"
      >
        <span className="size-2 rounded-full bg-white" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
