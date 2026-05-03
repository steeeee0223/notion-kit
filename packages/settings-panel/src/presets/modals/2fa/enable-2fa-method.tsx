import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from "@notion-kit/ui/primitives";

export function Enable2FAMethod() {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.2fa.enable-method",
  });

  return (
    <DialogContent className="w-[330px] p-5">
      <DialogHeader>
        <DialogIcon>
          <Icon.LockShield className="size-8 fill-icon" />
        </DialogIcon>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button className="group h-auto w-full items-start justify-start px-4 py-2.5 text-left">
          <Icon.AuthenticatorCode className="mr-2.5 size-5 fill-icon group-hover:fill-blue" />
          <div className="min-w-0">
            <div className="truncate text-sm leading-5">
              {t("authenticator.title")}
            </div>
            <span className="text-xs/[1.35] whitespace-normal text-muted">
              {t("authenticator.description")}
            </span>
          </div>
        </Button>
        <Button className="group h-auto w-full items-start justify-start px-4 py-2.5 text-left">
          <Icon.TextMessage className="mr-2.5 size-5 fill-icon group-hover:fill-blue" />
          <div className="min-w-0">
            <div className="truncate text-sm leading-5">{t("text.title")}</div>
            <span className="text-xs/[1.35] whitespace-normal text-muted">
              {t("text.description")}
            </span>
          </div>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
