import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from "@notion-kit/shadcn";

export function PasswordSuccess() {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.password",
  });

  return (
    <DialogContent className="w-70" hideClose>
      <DialogHeader>
        <DialogIcon>
          <Icon.Check className="size-[27px] fill-icon" />
        </DialogIcon>
        <DialogTitle>{t("success-title")}</DialogTitle>
        <DialogDescription>{t("success-description")}</DialogDescription>
      </DialogHeader>
    </DialogContent>
  );
}
