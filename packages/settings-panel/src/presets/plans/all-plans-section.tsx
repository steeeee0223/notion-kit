"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Separator } from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsSection, useSettings } from "../../core";
import { Scope } from "../../lib";
import { PlansTable } from "../tables";

export function AllPlansSection() {
  const { scopes } = useSettings();
  const canUpgrade = scopes.has(Scope.Upgrade);
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("plans.all-plans", { returnObjects: true });

  return (
    <SettingsSection title={trans.title} hideSeparator>
      <div className="mb-4 text-sm font-normal text-[#787774]">
        <TextLinks
          i18nKey="plans.all-plans.description"
          hrefs="https://www.notion.so/help/category/plans-billing-and-payment"
          target="_blank"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-5">
        <PlansTable canUpgrade={canUpgrade} />
        <Separator />
      </div>
    </SettingsSection>
  );
}
