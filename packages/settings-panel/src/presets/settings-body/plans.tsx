"use client";

import { useMediaQuery } from "usehooks-ts";

import { cn } from "@notion-kit/cn";
import { Hint } from "@notion-kit/common";
import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Plan } from "@notion-kit/schemas";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Separator,
} from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsSection, useSettings } from "../../core";
import { Scope } from "../../lib";
import { PlansTable } from "../plans";

const styles = {
  description: "text-sm font-normal text-[#787774]",
};

interface ActivePlanProps {
  activePlan: Plan;
  canUpgrade: boolean;
}
const ActivePlan: React.FC<ActivePlanProps> = ({ activePlan, canUpgrade }) => {
  const isMd = useMediaQuery("(min-width: 900px)");
  /** i18n */
  const { t } = useTranslation("settings");
  const { active } = t("plans", { returnObjects: true });
  return (
    <SettingsSection title={active.title} hideSeparator>
      <Card
        variant="popover"
        style={{ width: "unset" }}
        className="relative flex flex-wrap justify-between gap-8 rounded-xl p-5"
      >
        <CardContent className="flex flex-col gap-1.5">
          <CardTitle className="relative flex items-center gap-1 self-stretch text-[22px]/[26px] tracking-[-0.1px]">
            {active.plan[activePlan].title}{" "}
            {activePlan === Plan.EDUCATION && <Icon.Help />}
          </CardTitle>
          <CardDescription className="text-sm text-primary dark:text-primary/80">
            {active.plan[activePlan].description}
          </CardDescription>
          <div className="text-xs text-[#787774]">
            {active.plan[activePlan].comment}
          </div>
        </CardContent>
        <Card className="w-full max-w-[300px] flex-1 flex-wrap border-none bg-[#f9f9f8] px-4 py-3.5 dark:bg-modal">
          <CardContent
            className={cn(
              "relative flex flex-wrap justify-between gap-1.5",
              isMd && "flex-nowrap",
            )}
          >
            <div className="flex flex-col gap-1.5">
              <CardTitle className="relative flex items-center gap-1 self-stretch text-sm tracking-[-0.1px]">
                <Icon.Sparkle /> {active.ai.title}
              </CardTitle>
              <div className="text-xs text-[#787774]">
                {active.ai.description}
              </div>
            </div>
            <div className="flex items-center">
              <Hint
                description="Only workspace owners can perform this action."
                className={canUpgrade ? "hidden" : "w-[174px]"}
              >
                <Button
                  variant="blue"
                  size="sm"
                  className="h-7 px-2.5"
                  disabled={!canUpgrade}
                >
                  {active.ai.button}
                </Button>
              </Hint>
            </div>
          </CardContent>
        </Card>
      </Card>
    </SettingsSection>
  );
};

const AllPlans: React.FC<{ canUpgrade: boolean }> = ({ canUpgrade }) => {
  /** i18n */
  const { t } = useTranslation("settings");
  const { "all-plans": allPlans } = t("plans", { returnObjects: true });

  return (
    <SettingsSection title={allPlans.title} hideSeparator>
      <div className={cn(styles.description, "mb-4")}>
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
};

export const Plans = () => {
  const {
    scopes,
    settings: { workspace },
  } = useSettings();
  const canUpgrade = scopes.has(Scope.Upgrade);
  /** i18n */
  const { t } = useTranslation("settings");
  const { education, faq } = t("plans", { returnObjects: true });

  return (
    <div className="space-y-12">
      <ActivePlan activePlan={workspace.plan} canUpgrade={canUpgrade} />
      <AllPlans canUpgrade={canUpgrade} />
      {/* This part is optional! only `free` plan can see this */}
      {workspace.plan === Plan.FREE && (
        <SettingsSection title={education.title} hideSeparator>
          <div className={cn(styles.description, "mb-2")}>
            <TextLinks
              i18nKey="plans.education.description"
              hrefs="https://www.notion.so/product/notion-for-education"
              target="_blank"
            />
          </div>
          <Button size="sm" tabIndex={0}>
            {education.button}
          </Button>
        </SettingsSection>
      )}
      <SettingsSection title={faq.title} hideSeparator>
        <div className={cn(styles.description, "mb-2")}>
          <TextLinks
            i18nKey="plans.faq.description"
            hrefs="https://www.notion.so/help/category/plans-billing-and-payment"
            target="_blank"
          />
        </div>
        <Button size="sm" tabIndex={0}>
          {faq.button}
        </Button>
      </SettingsSection>
    </div>
  );
};
