"use client";

import { BaseModal } from "@notion-kit/common";
import { LOCALE, useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { SelectPreset as Select, Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../core";

export function RegionSection() {
  const {
    settings: { account },
    updateSettings,
  } = useSettings();
  /** i18n */
  const { t, i18n } = useTranslation("settings");
  const trans = t("preferences", {
    returnObjects: true,
  });
  /** Actions */
  const { openModal } = useModal();
  const switchLanguage = (language: LOCALE) => {
    const langLabel = trans.region.language.options[language].label;
    openModal(
      <BaseModal
        {...trans.modals.language}
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
    <SettingsSection title={trans.region.title}>
      <SettingsRule {...trans.region.language}>
        <Select
          options={trans.region.language.options}
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
      <SettingsRule {...trans.region["start-week"]}>
        <Switch size="sm" defaultChecked />
      </SettingsRule>
      <SettingsRule {...trans.region["set-timezone"]}>
        <Switch size="sm" />
      </SettingsRule>
      <SettingsRule {...trans.region.timezone}></SettingsRule>
    </SettingsSection>
  );
}
