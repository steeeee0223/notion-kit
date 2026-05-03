import { useTranslation } from "@notion-kit/ui/i18n";

import { HintButton } from "@/presets/_components";

import { EmailSection } from "./email-section";
import { NotificationsSection } from "./notifications-section";
import { SlackSection } from "./slack-section";

export function Notifications() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("notifications.buttons", { returnObjects: true });

  return (
    <div className="space-y-12">
      <NotificationsSection />
      <SlackSection />
      <EmailSection />
      <HintButton
        icon="help"
        label={trans.more}
        href="https://www.notion.com/help/add-and-manage-connections-with-the-api"
      />
    </div>
  );
}
