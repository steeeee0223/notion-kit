import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { cn } from "@notion-kit/cn";
import { RadioGroup, RadioGroupItem } from "@notion-kit/shadcn";

const meta = {
  title: "Shadcn/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const PLANS = [
  { value: "free", label: "Free", price: "$0 per member / month" },
  { value: "plus", label: "Plus", price: "$12 per member / month" },
  { value: "business", label: "Business", price: "$24 per member / month" },
  {
    value: "enterprise",
    label: "Enterprise",
    price: "Contact Sales for pricing",
  },
];

export const Example: Story = {
  render: () => (
    <RadioGroup defaultValue="plus" className="w-100 gap-2">
      {PLANS.map((plan) => (
        <label
          key={plan.value}
          htmlFor={`plan-${plan.value}`}
          className={cn(
            "flex h-[54px] cursor-pointer items-center gap-3 rounded-lg border border-border px-3 pr-4 transition-colors",
            "has-[[data-state=checked]]:border-blue has-[[data-state=checked]]:bg-blue/5",
            "hover:bg-primary/5",
          )}
        >
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[13px]/[18px] font-medium">{plan.label}</span>
            <span className="text-xs/4 text-secondary">{plan.price}</span>
          </div>
          <RadioGroupItem id={`plan-${plan.value}`} value={plan.value} />
        </label>
      ))}
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="free" className="w-100 gap-2">
      {PLANS.map((plan) => (
        <label
          key={plan.value}
          htmlFor={`disabled-${plan.value}`}
          className={cn(
            "flex h-[54px] items-center gap-3 rounded-lg border border-border px-3 pr-4",
            "has-[[data-state=checked]]:border-blue has-[[data-state=checked]]:bg-blue/5",
            "opacity-50",
          )}
        >
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[13px]/[18px] font-medium">{plan.label}</span>
            <span className="text-xs/4 text-secondary">{plan.price}</span>
          </div>
          <RadioGroupItem
            id={`disabled-${plan.value}`}
            value={plan.value}
            disabled
          />
        </label>
      ))}
    </RadioGroup>
  ),
};
