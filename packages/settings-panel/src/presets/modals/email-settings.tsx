import { Trans, useTranslation } from "@notion-kit/ui/i18n";
import { Button, DialogContent } from "@notion-kit/ui/primitives";

interface EmailSettingsProps {
  email: string;
  onSendVerification?: () => void;
}

export function EmailSettings({
  email,
  onSendVerification,
}: EmailSettingsProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.email-settings",
  });

  return (
    <DialogContent className="w-[460px] p-8 text-sm" hideClose noTitle>
      <p className="my-0">
        <Trans
          i18nKey="modals.email-settings.description"
          values={{ email }}
          components={{ 1: <span className="font-bold" /> }}
        />
      </p>
      <Button
        tabIndex={0}
        variant="blue"
        size="sm"
        className="max-w-fit shrink-0"
        onClick={onSendVerification}
      >
        {t("send")}
      </Button>
    </DialogContent>
  );
}
