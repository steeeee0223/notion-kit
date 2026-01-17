"use client";

import { useState } from "react";

import { AlertModal } from "@notion-kit/common/alert-modal";
import { TimezoneMenu } from "@notion-kit/common/timezone-menu";
import { LOCALE, useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Dialog,
  SelectPreset as Select,
  Switch,
} from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";
import { useAccountActions } from "../hooks";

export function RegionSection() {
  const { locale, timezone, update } = useAccountActions();
  /** i18n */
  const { t, i18n } = useTranslation("settings");
  const trans = t("preferences", { returnObjects: true });
  /** Actions */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LOCALE | null>(null);

  const switchLanguage = (language: LOCALE) => {
    setSelectedLanguage(language);
    setDialogOpen(true);
  };

  const handleConfirmLanguageChange = async () => {
    if (selectedLanguage) {
      await i18n.changeLanguage(selectedLanguage);
      await update({ language: selectedLanguage });
      setSelectedLanguage(null);
    }
    setDialogOpen(false);
  };

  const toggleAutoSetTimezone = async (checked: boolean) => {
    await update({
      timezone: checked
        ? undefined
        : Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  const langLabel = selectedLanguage
    ? trans.region.language.options[selectedLanguage].label
    : "";

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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertModal
          {...trans.modals.language}
          title={t("preferences.modals.language.title", {
            language: langLabel,
          })}
          onTrigger={handleConfirmLanguageChange}
        />
      </Dialog>
    </SettingsSection>
  );
}
