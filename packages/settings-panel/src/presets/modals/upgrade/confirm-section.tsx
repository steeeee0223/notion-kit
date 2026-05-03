import { useFormContext, useWatch } from "react-hook-form";

import { Trans, useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Checkbox,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Label,
} from "@notion-kit/ui/primitives";

import type { UpgradePlan, UpgradeSchema } from "@/lib/types";

interface ConfirmSectionProps {
  plan: UpgradePlan;
}

export function ConfirmSection({ plan }: ConfirmSectionProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.upgrade.confirm",
  });

  const { control, formState } = useFormContext<UpgradeSchema>();
  const billingInterval = useWatch({
    control,
    name: "billingInterval",
  });

  const price = billingInterval === "month" ? plan.monthly : plan.annual;

  return (
    <div className="flex flex-col gap-2">
      <Label>{t("title")}</Label>
      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[22px]/[26px] font-semibold">${price}</span>
            <span className="self-end pb-0.5 text-sm/5 font-medium">
              {t("per-month")}
            </span>
          </div>
          <Icon.ChevronDown className="size-3.5 fill-icon" />
        </div>
        <FormField
          control={control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="grid-cols-[1fr_auto]">
              <FormControl>
                <Checkbox
                  size="xs"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
              </FormControl>
              <label
                htmlFor={field.name}
                className="text-[10px]/[13px] text-secondary"
              >
                <Trans
                  i18nKey="terms-description"
                  t={t}
                  values={{ interval: billingInterval }}
                  components={{
                    1: (
                      <a
                        href="https://www.notion.so/notion/Terms-and-Privacy-28ffdd083dc3473e9c2da6ec011b58ac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        terms
                      </a>
                    ),
                  }}
                />
              </label>
              <FormMessage className="col-span-2" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="blue"
          size="sm"
          className="w-full"
          disabled={formState.isSubmitting}
        >
          {t("submit", { plan: plan.name })}
        </Button>
      </div>
    </div>
  );
}
