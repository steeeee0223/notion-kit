"use client";

import { useState, useTransition } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Plan } from "@notion-kit/schemas";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  RadioGroup,
  RadioGroupItem,
  Spinner,
} from "@notion-kit/shadcn";

const PLAN_OPTIONS = [
  { value: Plan.FREE, label: "Free", price: "$0 per member / month" },
  { value: Plan.PLUS, label: "Plus", price: "$12 per member / month" },
  {
    value: Plan.BUSINESS,
    label: "Business",
    price: "$24 per member / month",
  },
  {
    value: Plan.ENTERPRISE,
    label: "Enterprise",
    price: "Contact Sales for pricing",
  },
] as const;

interface ChangePlanProps {
  currentPlan?: Plan;
  onConfirm?: (plan: Plan) => Promise<void>;
}

export function ChangePlan({ currentPlan, onConfirm }: ChangePlanProps) {
  const [selected, setSelected] = useState(currentPlan);
  const [isPending, startTransition] = useTransition();
  const submit = () => {
    startTransition(async () => {
      if (!selected) return;
      await onConfirm?.(selected);
    });
  };

  return (
    <DialogContent className="max-h-[744px] w-fit max-w-[966px] min-w-[425px] gap-6">
      <DialogHeader>
        <Icon.ArrowLeftRight className="size-9 fill-secondary" />
        <DialogTitle typography="h2">
          Which plan do you want to change to?
        </DialogTitle>
        <DialogDescription>
          Pick one of the following Notion plans
        </DialogDescription>
      </DialogHeader>
      <RadioGroup
        value={selected}
        onValueChange={(v) => setSelected(v as Plan)}
        className="gap-2 overflow-y-auto px-0.5"
      >
        {PLAN_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <label
              key={option.value}
              htmlFor={`plan-${option.value}`}
              aria-label={`${option.label} - ${option.price}`}
              className={cn(
                "flex h-[54px] cursor-pointer items-center gap-3 rounded-lg border px-3 pr-4 transition-colors",
                isSelected
                  ? "border-blue bg-blue/5"
                  : "border-border hover:bg-primary/5",
              )}
            >
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[13px]/[18px] font-medium">
                  {option.label}
                </span>
                <span className="text-xs/4 text-secondary">{option.price}</span>
              </div>
              <RadioGroupItem
                id={`plan-${option.value}`}
                value={option.value}
              />
            </label>
          );
        })}
      </RadioGroup>
      <div className="flex flex-col gap-2">
        <Button
          variant="blue"
          size="sm"
          disabled={!selected || selected === currentPlan || isPending}
          onClick={submit}
        >
          Continue
          {isPending && <Spinner />}
        </Button>
        <DialogClose asChild>
          <Button variant="hint" size="sm" className="text-secondary">
            Cancel
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}
