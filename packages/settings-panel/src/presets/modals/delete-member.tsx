import { useTransition } from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  Label,
  Spinner,
} from "@notion-kit/shadcn";

interface DeleteMemberProps {
  onDelete?: () => void;
}

export function DeleteMember({ onDelete }: DeleteMemberProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.delete-member",
  });

  const [loading, startTransition] = useTransition();
  const onRemove = () => startTransition(() => onDelete?.());

  return (
    <DialogContent className="flex w-[406px] flex-col items-start justify-center gap-6 p-5">
      <DialogHeader align="center">
        <DialogIcon>
          <Icon.UserX className="size-9 fill-default/45" />
        </DialogIcon>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>
      </DialogHeader>
      <Card className="w-full" asButton={false}>
        <CardContent className="flex w-full flex-col items-start gap-4 p-4">
          {options.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <Checkbox id={option} size="xs" className="border-[1.5px]" />
              <Label htmlFor={option}>{t(`options.${option}`)}</Label>
            </div>
          ))}
        </CardContent>
      </Card>
      <DialogFooter>
        <Button
          onClick={onRemove}
          variant="blue"
          size="sm"
          className="w-full font-semibold"
        >
          {t("continue")}
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

const options = [
  "no-longer-need",
  "not-using-enough",
  "too-expensive",
  "switching-tool",
  "no-longer-works",
  "switching-workspace",
  "other",
] as const;
