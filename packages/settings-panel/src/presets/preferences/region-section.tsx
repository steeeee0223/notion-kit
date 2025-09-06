"use client";

import { useLocalStorage } from "usehooks-ts";

import { BaseModal } from "@notion-kit/common";
import { LOCALE, useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { SelectPreset as Select, Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { LOCALSTORAGE_KEYS } from "../../lib";
import { TimezoneMenu } from "./timezone-menu";

export function RegionSection() {
  const {
    settings: { account },
    account: actions,
  } = useSettings();
  /** i18n */
  const { t, i18n } = useTranslation("settings");
  const trans = t("preferences", { returnObjects: true });
  /** Localstorage */
  const [locale, setLocale] = useLocalStorage(
    LOCALSTORAGE_KEYS.locale,
    account.language ?? "en",
  );
  const [timezone, setTimezone] = useLocalStorage(
    LOCALSTORAGE_KEYS.timezone,
    account.timezone,
  );
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
          setLocale(language);
          await i18n.changeLanguage(language);
          await actions?.update?.({ language });
        }}
      />,
    );
  };
  const changeTimzone = (timezone?: string) => {
    setTimezone(timezone);
    void actions?.update?.({ timezone });
  };
  const toggleAutoSetTimezone = (checked: boolean) => {
    changeTimzone(
      checked ? undefined : Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  };

  return (
    <SettingsSection title={trans.region.title}>
      <SettingsRule {...trans.region.language}>
        <Select
          options={trans.region.language.options}
          value={locale}
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
        <Switch
          size="sm"
          checked={!timezone}
          onCheckedChange={toggleAutoSetTimezone}
        />
      </SettingsRule>
      <SettingsRule {...trans.region.timezone}>
        <TimezoneMenu currentTz={timezone} onChange={changeTimzone} />
      </SettingsRule>
    </SettingsSection>
  );
}
