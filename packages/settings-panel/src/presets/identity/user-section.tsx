import { Plan } from "@notion-kit/schemas";
import { useTranslation } from "@notion-kit/ui/i18n";

import { SettingsSection } from "@/core";
import {
  HintButton,
  UpgradeSettingsRule as SettingsRule,
} from "@/presets/_components";

export function UserSection() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("identity.user", { returnObjects: true });

  return (
    <SettingsSection title={trans.title}>
      <div className="text-sm/4 font-normal text-secondary">
        {trans.description}
      </div>
      <HintButton
        icon="help"
        label={trans.buttons.hint}
        href="https://www.notion.com/help/managed-users-dashboard"
      />
      <SettingsRule {...trans.dashboard} plan={Plan.ENTERPRISE} />
      <SettingsRule {...trans.profile} plan={Plan.ENTERPRISE} />
      <SettingsRule {...trans.external} plan={Plan.ENTERPRISE} />
      <SettingsRule {...trans.support} plan={Plan.ENTERPRISE} />
      <SettingsRule {...trans.session} plan={Plan.ENTERPRISE} />
      <SettingsRule {...trans.logout} plan={Plan.ENTERPRISE} />
      <SettingsRule {...trans.password} plan={Plan.ENTERPRISE} />
      <SettingsRule {...trans.mail} plan={Plan.ENTERPRISE} />
    </SettingsSection>
  );
}
