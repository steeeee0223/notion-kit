import { useTransition } from "react";

import { useTranslation } from "@notion-kit/i18n";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@notion-kit/ui/primitives";

interface LeaveTeamspaceProps {
  name: string;
  onLeave?: () => void;
}

/**
 * @note cloned from `DeleteGuest`
 */
export function LeaveTeamspace({ name, onLeave }: LeaveTeamspaceProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.leave-teamspace",
  });

  const [isLeaving, startTransition] = useTransition();
  const leave = () => startTransition(() => onLeave?.());

  return (
    <DialogContent className="w-[300px] p-5">
      <DialogHeader>
        <DialogTitle typography="h2">{t("title", { name })}</DialogTitle>
      </DialogHeader>
      <DialogDescription className="text-muted">
        {t("description")}
      </DialogDescription>
      <DialogFooter>
        <Button
          onClick={leave}
          variant="red-fill"
          size="sm"
          className="w-full font-semibold"
          disabled={isLeaving}
        >
          {t("remove")}
          {isLeaving && <Spinner />}
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
