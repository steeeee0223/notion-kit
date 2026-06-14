import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Role, type User } from "@notion-kit/schemas";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Separator,
  Spinner,
  Textarea,
} from "@notion-kit/ui/primitives";

import {
  addMembersSchema,
  AddMembersSchema,
  EmailsField,
  RolesField,
} from "./fields";

interface AddMembersProps {
  invitedMembers: User[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: AddMembersSchema) => Promise<void>;
}

export function AddMembers({
  invitedMembers,
  open,
  onOpenChange,
  onAdd,
}: AddMembersProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-members",
  });

  const form = useForm<AddMembersSchema>({
    resolver: zodResolver(addMembersSchema),
    defaultValues: {
      _emailInput: "",
      emails: [],
      role: Role.OWNER,
      message: "",
    },
  });

  /** Actions */
  const invite = form.handleSubmit(async (values) => {
    await onAdd?.(values);
    onClose();
  });

  const onClose = () => {
    onOpenChange?.(false);
    form.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (nextOpen ? onOpenChange?.(true) : onClose())}
    >
      <DialogContent hideClose className="w-115">
        <DialogHeader>
          <DialogIcon>
            <Icon.InviteMemberSmall className="size-9 fill-icon" />
          </DialogIcon>
          <DialogTitle typography="h2">{t("title")}</DialogTitle>
          <DialogDescription className="text-muted">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={invite} className="space-y-4">
            <EmailsField invitedMembers={invitedMembers} />
            <Separator />
            <RolesField />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("message-label")}</FormLabel>
                  <FormControl
                    render={
                      <Textarea
                        placeholder={t("message-placeholder")}
                        {...field}
                      />
                    }
                  />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                variant="blue"
                size="sm"
                className="w-full"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {t("invite")}
                {form.formState.isSubmitting && <Spinner />}
              </Button>
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="hint"
                    size="sm"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {t("cancel")}
                  </Button>
                }
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
