import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/mini";

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@notion-kit/shadcn";

const userSchema = z.object({
  email: z.email(),
});
type UserSchema = z.infer<typeof userSchema>;

interface DeleteAccountProps {
  email: string;
  onSubmit?: (email: string) => void | Promise<void>;
}

export function DeleteAccount({ email, onSubmit }: DeleteAccountProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.delete-account",
  });

  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "" },
  });
  const submit = form.handleSubmit(async (value: UserSchema) => {
    if (value.email === email) {
      await onSubmit?.(email);
    } else {
      form.reset();
    }
  });

  return (
    <DialogContent className="w-[420px] p-5">
      <DialogHeader>
        <DialogIcon>
          <Icon.ExclamationMarkCircled className="size-9 fill-red" />
        </DialogIcon>
        <DialogTitle typography="h2">{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={submit} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    data-size="lg"
                    placeholder={email}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {form.formState.errors.email && (
            <FormMessage>{t("validation", { email })}</FormMessage>
          )}
          <DialogFooter>
            <Button
              type="submit"
              variant="red-fill"
              size="sm"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {t("delete")}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="hint"
                size="sm"
                className="h-7 w-fit"
                disabled={form.formState.isSubmitting}
              >
                {t("cancel")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
