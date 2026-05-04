import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Button, Switch } from "@notion-kit/ui/primitives";

import { SettingsRule, SettingsSection } from "../../core";

export function EmailSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("notifications.email", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.activity}>
        <Switch size="sm" />
      </SettingsRule>
      <SettingsRule {...trans.digests}>
        <Switch size="sm" />
      </SettingsRule>
      <SettingsRule {...trans.announcements}>
        <Button size="sm">
          <Icon.ArrowDiagonalUpRight className="mr-2 size-4 fill-current" />
          {trans.announcements.button}
        </Button>
      </SettingsRule>
    </SettingsSection>
  );
}
