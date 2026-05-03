import { useTranslation } from "@notion-kit/ui/i18n";

import { HintButton } from "@/presets/_components";

import { Title } from "./common";

export function SecurityContent() {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.teamspace-detail.security",
  });

  return (
    <>
      <Title title={t("title")} />
      <HintButton
        icon="help"
        label={t("learn-more")}
        href="https://www.notion.com/help/intro-to-teamspaces#modify-teamspace-settings"
      />
    </>
  );
}
