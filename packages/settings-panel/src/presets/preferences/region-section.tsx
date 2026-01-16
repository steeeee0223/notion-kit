"use client";

import { BaseModal } from "@notion-kit/common/base-modal";
import { TimezoneMenu } from "@notion-kit/common/timezone-menu";
import { LOCALE, useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import { Button, SelectPreset as Select, Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";
import { useAccountActions } from "../hooks";

export function RegionSection() {
  const { locale, timezone, update } = useAccountActions();
  /** i18n */
  const { t, i18n } = useTranslation("settings");
  const trans = t("preferences", { returnObjects: true });
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
          await i18n.changeLanguage(language);
          await update({ language });
        }}
      />,
    );
  };

  const toggleAutoSetTimezone = async (checked: boolean) => {
    await update({
      timezone: checked
        ? undefined
        : Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
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
        <TimezoneMenu
          currentTz={timezone}
          onChange={(timezone) => update({ timezone })}
          renderTrigger={({ tz, gmt }) => (
            <Button
              variant="hint"
              className="h-7 p-2 font-normal text-primary"
              disabled={!tz}
            >
              {`(${gmt}) ${tz}`}
              <Icon.ChevronDown className="fill-icon" />
            </Button>
          )}
        />
      </SettingsRule>
    </SettingsSection>
  );
}
