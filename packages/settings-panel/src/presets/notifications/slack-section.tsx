import { useTranslation } from "@notion-kit/i18n";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "@/core";

export function SlackSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("notifications.slack", { returnObjects: true });
  const options = Object.entries(trans.slack.options).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.slack}>
        <Select items={options} defaultValue="off">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
