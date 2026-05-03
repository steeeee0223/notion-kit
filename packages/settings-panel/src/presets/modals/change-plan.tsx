import { useState, useTransition } from "react";

import { cn } from "@notion-kit/cn";
import { useTranslation } from "@notion-kit/i18n";
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
} from "@notion-kit/ui/primitives";

const PLAN_OPTIONS = [
  {
    value: Plan.FREE,
    labelKey: "plans.free",
    priceKey: "prices.per-member",
    priceObj: { price: "$0" },
  },
  {
    value: Plan.PLUS,
    labelKey: "plans.plus",
    priceKey: "prices.per-member",
    priceObj: { price: "$12" },
  },
  {
    value: Plan.BUSINESS,
    labelKey: "plans.business",
    priceKey: "prices.per-member",
    priceObj: { price: "$24" },
  },
  {
    value: Plan.ENTERPRISE,
    labelKey: "plans.enterprise",
    priceKey: "prices.contact",
    priceObj: { price: undefined },
  },
] as const;

interface ChangePlanProps {
  currentPlan?: Plan;
  onConfirm?: (plan: Plan) => Promise<void>;
}

export function ChangePlan({ currentPlan, onConfirm }: ChangePlanProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.change-plan",
  });

  const [selected, setSelected] = useState(currentPlan);
  const [isPending, startTransition] = useTransition();
  const submit = () => {
    if (!selected) return;
    startTransition(async () => await onConfirm?.(selected));
  };

  return (
    <DialogContent className="max-h-[744px] w-fit max-w-[966px] min-w-[425px] gap-6">
      <DialogHeader>
        <Icon.ArrowLeftRight className="size-9 fill-secondary" />
        <DialogTitle typography="h2">{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>
      </DialogHeader>
      <RadioGroup
        value={selected}
        onValueChange={(v) => setSelected(v as Plan)}
        className="gap-2 overflow-y-auto px-0.5"
      >
        {PLAN_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          const label = t(option.labelKey);
          const price = t(option.priceKey, option.priceObj);
          return (
            <label
              key={option.value}
              htmlFor={`plan-${option.value}`}
              aria-label={`${label} - ${price}`}
              className={cn(
                "flex h-[54px] cursor-pointer items-center gap-3 rounded-lg border px-3 pr-4 transition-colors",
                isSelected
                  ? "border-blue bg-blue/5"
                  : "border-border hover:bg-primary/5",
              )}
            >
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[13px]/[18px] font-medium">{label}</span>
                <span className="text-xs/4 text-secondary">{price}</span>
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
          {t("continue")}
          {isPending && <Spinner />}
        </Button>
        <DialogClose asChild>
          <Button variant="hint" size="sm" className="text-secondary">
            {t("cancel")}
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}
