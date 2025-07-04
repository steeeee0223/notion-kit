"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Button } from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsSection } from "../../core";

export function EducationSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("plans.education", { returnObjects: true });

  return (
    <SettingsSection title={trans.title} hideSeparator>
      <div className="mb-2 text-sm font-normal text-[#787774]">
        <TextLinks
          i18nKey="plans.education.description"
          hrefs="https://www.notion.so/product/notion-for-education"
          target="_blank"
        />
      </div>
      <Button size="sm" tabIndex={0}>
        {trans.button}
      </Button>
    </SettingsSection>
  );
}
