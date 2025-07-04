"use client";

import { useMediaQuery } from "usehooks-ts";

import { cn } from "@notion-kit/cn";
import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Plan } from "@notion-kit/schemas";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { SettingsSection, useSettings } from "../../core";
import { Scope } from "../../lib";

export function ActivePlanSection() {
  const { scopes, settings } = useSettings();
  const canUpgrade = scopes.has(Scope.Upgrade);
  const activePlan = settings.workspace.plan;
  const isMd = useMediaQuery("(min-width: 900px)");
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("plans.active", { returnObjects: true });
  return (
    <SettingsSection title={trans.title} hideSeparator>
      <Card
        variant="popover"
        style={{ width: "unset" }}
        className="relative flex flex-wrap justify-between gap-8 rounded-xl p-5"
      >
        <CardContent className="flex flex-col gap-1.5">
          <CardTitle className="relative flex items-center gap-1 self-stretch text-[22px]/[26px] tracking-[-0.1px]">
            {trans.plan[activePlan].title}{" "}
            {activePlan === Plan.EDUCATION && <Icon.QuestionMarkCircled />}
          </CardTitle>
          <CardDescription className="text-sm text-primary">
            {trans.plan[activePlan].description}
          </CardDescription>
          <div className="text-xs text-[#787774]">
            {trans.plan[activePlan].comment}
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
                <Icon.Sparkle /> {trans.ai.title}
              </CardTitle>
              <div className="text-xs text-[#787774]">
                {trans.ai.description}
              </div>
            </div>
            <div className="flex items-center">
              <TooltipPreset
                description="Only workspace owners can perform this action."
                className={canUpgrade ? "hidden" : "w-[174px]"}
              >
                <Button
                  variant="blue"
                  size="sm"
                  className="h-7 px-2.5"
                  disabled={!canUpgrade}
                >
                  {trans.ai.button}
                </Button>
              </TooltipPreset>
            </div>
          </CardContent>
        </Card>
      </Card>
    </SettingsSection>
  );
}
