import { useFormContext } from "react-hook-form";

import { cn } from "@notion-kit/cn";
import { useTranslation } from "@notion-kit/ui/i18n";
import {
  Badge,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@notion-kit/ui/primitives";

import type { UpgradePlan, UpgradeSchema } from "@/lib/types";

interface BillingOptionsProps {
  plan: UpgradePlan;
}

export function BillingOptions({ plan }: BillingOptionsProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.upgrade.billing-options",
  });

  const { control } = useFormContext<UpgradeSchema>();

  return (
    <FormField
      control={control}
      name="billingInterval"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("title")}</FormLabel>
          <BillingOption
            id="billing-monthly"
            label={t("monthly")}
            description={t("monthly-desc", {
              price: String(plan.monthly),
            })}
            checked={field.value === "month"}
            onChange={() => field.onChange("month")}
          />
          <BillingOption
            id="billing-annual"
            label={t("annually")}
            description={t("annually-desc", { price: plan.annual })}
            checked={field.value === "year"}
            onChange={() => field.onChange("year")}
            badge={t("save-badge")}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface BillingOptionProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  badge?: string;
}

function BillingOption({
  id,
  label,
  description,
  checked,
  onChange,
  badge,
}: BillingOptionProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md border p-2.5 pr-4",
        checked ? "border-blue" : "border-border",
      )}
    >
      <div className="flex items-center">
        <input
          type="radio"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className={`flex size-[18px] items-center justify-center rounded-full border-[1.5px] ${
            checked ? "border-blue bg-blue" : "border-border-button bg-main"
          }`}
        >
          {checked && <span className="size-[7px] rounded-full bg-white" />}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[13px]/[18px] font-medium text-primary">
          {label}
        </span>
        <span className="text-xs/4 text-secondary">{description}</span>
      </div>
      {badge && (
        <Badge variant="blue" className="shrink-0 rounded-sm">
          {badge}
        </Badge>
      )}
    </label>
  );
}
