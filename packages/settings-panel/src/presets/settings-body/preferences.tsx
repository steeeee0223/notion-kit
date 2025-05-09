"use client";

import { BaseModal } from "@notion-kit/common";
import { LOCALE, useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { Select } from "@notion-kit/select";
import { Switch } from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";

export const Preferences = () => {
  const {
    settings: { account },
    theme,
    setTheme,
    updateSettings,
  } = useSettings();
  /** i18n */
  const { t, i18n } = useTranslation("settings");
  const { title, preferences, region, desktop, privacy, modals } = t(
    "preferences",
    {
      returnObjects: true,
    },
  );
  /** Actions */
  const { openModal } = useModal();
  const switchLanguage = (language: LOCALE) => {
    const langLabel = region.language.options[language].label;
    openModal(
      <BaseModal
        {...modals.language}
        title={t("preferences.modals.language.title", {
          language: langLabel,
        })}
        onTrigger={async () => {
          await updateSettings?.({ account: { language } });
          await i18n.changeLanguage(language);
        }}
      />,
    );
  };

  return (
    <div className="space-y-12">
      <SettingsSection title={title}>
        <SettingsRule {...preferences.appearance}>
          <Select
            options={preferences.appearance.options}
            value={theme ?? "system"}
            onChange={setTheme}
            side="left"
          />
        </SettingsRule>
      </SettingsSection>
      <SettingsSection title={region.title}>
        <SettingsRule {...region.language}>
          <Select
            options={region.language.options}
            value={account.language ?? "en"}
            onChange={switchLanguage}
            side="bottom"
            align="end"
            renderOption={({ option }) => (
              <div className="truncate text-secondary">
                {typeof option === "string" ? option : option?.label}
              </div>
            )}
          />
        </SettingsRule>
        <SettingsRule {...region["start-week"]}>
          <Switch size="sm" defaultChecked />
        </SettingsRule>
        <SettingsRule {...region["set-timezone"]}>
          <Switch size="sm" />
        </SettingsRule>
        <SettingsRule {...region.timezone}></SettingsRule>
      </SettingsSection>
      <SettingsSection title={desktop.title}>
        <SettingsRule {...desktop["open-on-start"]}>
          <Select
            options={desktop["open-on-start"].options}
            value="top"
            side="left"
          />
        </SettingsRule>
        <SettingsRule
          title={desktop["open-links"].title}
          description={
            <TextLinks
              i18nKey="preferences.desktop.open-links.description"
              hrefs="https://www.notion.so/desktop"
            />
          }
        >
          <Switch size="sm" />
        </SettingsRule>
      </SettingsSection>
      <SettingsSection title={privacy.title}>
        <SettingsRule
          title={privacy.cookie.title}
          description={
            <TextLinks
              i18nKey="preferences.privacy.cookie.description"
              hrefs="https://notion.notion.site/Cookie-Notice-bc186044eed5488a8387a9e94b14e58c"
            />
          }
        />
        <SettingsRule
          title={privacy["view-history"].title}
          description={
            <TextLinks
              i18nKey="preferences.privacy.view-history.description"
              hrefs="https://www.notion.so/help/page-analytics"
            />
          }
        >
          <Select
            options={privacy["view-history"].options}
            value="yes"
            side="left"
          />
        </SettingsRule>
        <SettingsRule
          title={privacy["discover-profile"].title}
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
    </div>
  );
};
