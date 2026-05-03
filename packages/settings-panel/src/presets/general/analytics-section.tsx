import { useTranslation } from "@notion-kit/ui/i18n";
import { Switch } from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "@/core";
import { HintButton, TextLinks } from "@/presets/_components";
import { useWorkspace } from "@/presets/hooks";

export function AnalyticsSection() {
  const { data: workspace } = useWorkspace();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.analytics", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule
        title={trans.analytics.title}
        description={
          <TextLinks
            i18nKey="general.analytics.analytics.description"
            values={{ workspace: workspace.name }}
          />
        }
      >
        <Switch size="sm" />
      </SettingsRule>
      <HintButton
        icon="help"
        label={trans.analytics.hint}
        href="https://www.notion.com/help/workspace-analytics"
      />
    </SettingsSection>
  );
}
