"use client";

import { useTranslation } from "@notion-kit/i18n";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useTheme,
} from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "../../core";

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("preferences", {
    returnObjects: true,
  });
  const options = Object.entries<string>(
    trans.preferences.appearance.options,
  ).map(([value, label]) => ({ value, label }));

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.preferences.appearance}>
        <Select
          items={options}
          value={theme ?? "system"}
          onValueChange={(nextValue) => {
            if (nextValue !== null) setTheme(nextValue);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="left">
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option.value} {...option} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </SettingsRule>
    </SettingsSection>
  );
}
