"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Switch } from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";

export const NotionAI = () => {
  /** i18n */
  const { t } = useTranslation("settings");
  const { title, "notion-ai": notionAI } = t("notion-ai", {
    returnObjects: true,
  });

  return (
    <div>
      <SettingsSection title={title}>
        <SettingsRule
          title={notionAI.share.title}
          description={
            <TextLinks
              i18nKey="notion-ai.notion-ai.share.description"
              hrefs={[
                "https://notion.notion.site/Notion-AI-Learning-and-Early-Access-Program-Terms-0c55d702d0154a788d9e70c4ee396399",
                "https://www.notion.com/help/notion-ai-leap-program-faqs",
              ]}
            />
          }
        >
          <Switch size="sm" disabled />
        </SettingsRule>
      </SettingsSection>
    </div>
  );
};
