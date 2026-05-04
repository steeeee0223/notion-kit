import { useFormContext } from "react-hook-form";

import { useTranslation } from "@notion-kit/i18n";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@notion-kit/ui/primitives";

import type { UpgradeSchema } from "@/lib/types";

export function BillingDetails() {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.upgrade.billing-details",
  });

  const { control } = useFormContext<UpgradeSchema>();

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("name-label")}</FormLabel>
            <FormControl>
              <Input placeholder={t("name-placeholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("business-name-label")}</FormLabel>
            <FormControl>
              <Input placeholder={t("business-name-placeholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="vatId"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>{t("vat-label")}</FormLabel>
            <FormControl>
              <Input placeholder={t("vat-placeholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
