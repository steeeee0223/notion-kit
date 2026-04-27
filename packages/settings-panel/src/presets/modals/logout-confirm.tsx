import { useTransition } from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  Spinner,
} from "@notion-kit/shadcn";

interface LogoutConfirmProps {
  title: string;
  description: string;
  onConfirm?: () => Promise<void> | void;
}

export function LogoutConfirm({
  title,
  description,
  onConfirm,
}: LogoutConfirmProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.logout-confirm",
  });

  const [isPending, startTransition] = useTransition();
  const logout = () => startTransition(async () => await onConfirm?.());

  return (
    <DialogContent className="w-[324px] p-5" hideClose>
      <DialogHeader align="center">
        <DialogIcon>
          <Icon.PersonBadgeExclamationMark className="size-8 fill-icon" />
        </DialogIcon>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          type="submit"
          variant="red-fill"
          size="sm"
          className="w-full"
          onClick={logout}
          disabled={isPending}
        >
          {isPending && <Spinner />}
          {t("logout")}
        </Button>
        <DialogClose asChild>
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
