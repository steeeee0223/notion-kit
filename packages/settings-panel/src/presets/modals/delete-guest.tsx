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

interface DeleteGuestProps {
  name: string;
  onDelete?: () => void;
}

export function DeleteGuest({ name, onDelete }: DeleteGuestProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.delete-guest",
  });

  const [loading, startTransition] = useTransition();
  const onRemove = () => startTransition(() => onDelete?.());

  return (
    <DialogContent className="w-[300px] p-5">
      <DialogHeader align="center">
        <DialogIcon>
          <Icon.UserX className="size-9 fill-default/45" />
        </DialogIcon>
        <DialogTitle>{t("title", { name })}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          onClick={onRemove}
          variant="red-fill"
          size="sm"
          className="w-full font-semibold"
        >
          {t("remove")}
          {loading && <Spinner />}
        </Button>
        <DialogClose asChild>
          <Button variant="hint" size="sm" className="h-7 w-fit">
            {t("cancel")}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
