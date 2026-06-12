"use client";

import { useState } from "react";

import { LOCALE, useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { AlertModal } from "@notion-kit/ui/alert-modal";
import {
  Button,
  Dialog,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@notion-kit/ui/primitives";
import { TimezoneMenu } from "@notion-kit/ui/timezone-menu";

import { SettingsRule, SettingsSection } from "../../core";
import { useAccountActions } from "../hooks";

interface LocaleOption {
  value: LOCALE;
  label: string;
  desc: string;
}

export function RegionSection() {
  const { locale, timezone, update } = useAccountActions();
  /** i18n */
  const { t, i18n } = useTranslation("settings");
  const trans = t("preferences", { returnObjects: true });
  const localeOptions = Object.entries(
    trans.region.language.options,
  ).map<LocaleOption>(([value, option]) => ({
    value: value as LOCALE,
    label: option.label,
    desc: option.description,
  }));
  const selectedLocale = localeOptions.find(
    (option) => option.value === locale,
  );
  /** Actions */
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleConfirmLanguageChange = async () => {
    if (selectedLocale) {
      await i18n.changeLanguage(selectedLocale.value);
      await update({ language: selectedLocale.value });
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

  return (
    <SettingsSection title={trans.region.title}>
      <SettingsRule {...trans.region.language}>
        <Select<LocaleOption>
          items={localeOptions}
          value={selectedLocale}
          onValueChange={() => setDialogOpen(true)}
        >
          <SelectTrigger>
            <SelectValue>
              {(option: LocaleOption) => (
                <div className="truncate text-secondary">{option.label}</div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent side="bottom" align="end">
            <SelectGroup>
              {localeOptions.map((option) => (
                <SelectItem key={option.value} {...option} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
              <Icon.Chevron side="down" className="fill-icon" />
            </Button>
          )}
        />
      </SettingsRule>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertModal
          {...trans.modals.language}
          title={t("preferences.modals.language.title", {
            language: selectedLocale?.label,
          })}
          onTrigger={handleConfirmLanguageChange}
        />
      </Dialog>
    </SettingsSection>
  );
}
