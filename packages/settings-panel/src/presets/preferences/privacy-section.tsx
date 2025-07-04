"use client";

import { useTranslation } from "@notion-kit/i18n";
import { SelectPreset as Select, Switch } from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsRule, SettingsSection } from "../../core";

export function PrivacySection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("preferences.privacy", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans.cookie.title}
        description={
          <TextLinks
            i18nKey="preferences.privacy.cookie.description"
            hrefs="https://notion.notion.site/Cookie-Notice-bc186044eed5488a8387a9e94b14e58c"
          />
        }
      />
      <SettingsRule
        title={trans["view-history"].title}
        description={
          <TextLinks
            i18nKey="preferences.privacy.view-history.description"
            hrefs="https://www.notion.so/help/page-analytics"
          />
        }
      >
        <Select
          options={trans["view-history"].options}
          value="yes"
          side="left"
        />
      </SettingsRule>
      <SettingsRule
        title={trans["discover-profile"].title}
        description={
          <TextLinks
            i18nKey="preferences.privacy.discover-profile.description"
            hrefs="https://www.notion.so/help/account-settings#profile-settings"
          />
        }
      >
        <Switch size="sm" />
      </SettingsRule>
    </SettingsSection>
  );
}
