import { useTranslation } from "@notion-kit/i18n";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "@/core";
import { TextLinks } from "@/presets/_components";

export function DesktopSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("preferences.desktop", { returnObjects: true });
  const openOnStartOptions = Object.entries(trans["open-on-start"].options).map(
    ([value, label]) => ({ value, label }),
  );

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans["open-on-start"]}>
        <Select items={openOnStartOptions} value="top">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="left">
            <SelectGroup>
              {openOnStartOptions.map((option) => (
                <SelectItem key={option.value} {...option} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </SettingsRule>
      <SettingsRule
        title={trans["open-links"].title}
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
  );
}
