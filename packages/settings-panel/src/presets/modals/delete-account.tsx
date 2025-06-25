"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useModal } from "@notion-kit/modal";
import {
  Button,
  Dialog,
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
  email: z.string().email(),
});

interface DeleteAccountProps {
  email: string;
  onSubmit?: (email: string) => void | Promise<void>;
}

export const DeleteAccount = ({ email, onSubmit }: DeleteAccountProps) => {
  const { isOpen, closeModal } = useModal();
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "" },
  });
  const onClose = () => {
    closeModal();
    form.reset();
    form.clearErrors();
  };
  const submit = async (value: z.infer<typeof userSchema>) => {
    if (value.email === email) {
      onClose();
      await onSubmit?.(email);
    } else {
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="w-[420px] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogIcon>
            <CircleAlert className="size-9 text-red" />
          </DialogIcon>
          <DialogTitle typography="h2">
            Delete your entire account permanently?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            entire account. All private workspaces will be deleted, and you will
            be removed from all shared workspaces.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please type in your email to confirm.</FormLabel>
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
              <FormMessage>{`Please type "${email}" to continue`}</FormMessage>
            )}
            <DialogFooter>
              <Button
                type="submit"
                variant="red-fill"
                size="sm"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                Permanently delete account
              </Button>
              <Button
                onClick={onClose}
                variant="hint"
                size="sm"
                className="h-7 w-fit"
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
