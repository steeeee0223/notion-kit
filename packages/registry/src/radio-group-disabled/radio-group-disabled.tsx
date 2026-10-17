import { cn } from "@notion-kit/cn";
import { RadioGroup, RadioGroupItem } from "@notion-kit/ui/primitives";

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

export default function RadioGroupDisabled() {
  return (
    <RadioGroup aria-label="Plan" defaultValue="free" className="w-100 gap-2">
      {PLANS.map((plan) => (
        <label
          key={plan.value}
          htmlFor={`disabled-${plan.value}`}
          className={cn(
            "flex h-[54px] items-center gap-3 rounded-lg border border-border px-3 pr-4",
            "has-data-[checked]:border-blue has-data-[checked]:bg-blue/5",
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
  );
}
