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
  Form,
  FormControl,
  FormField,
  FormItem,
  Input,
} from "@notion-kit/shadcn";

const workspaceSchema = z.object({
  name: z.string(),
});

interface DeleteWorkspaceProps {
  name: string;
  onSubmit?: (name: string) => void | Promise<void>;
}

export const DeleteWorkspace = ({ name, onSubmit }: DeleteWorkspaceProps) => {
  const { isOpen, closeModal } = useModal();
  const form = useForm<z.infer<typeof workspaceSchema>>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "" },
  });
  const onClose = () => {
    closeModal();
    form.reset();
    form.clearErrors();
  };
  const submit = async (value: z.infer<typeof workspaceSchema>) => {
    if (value.name === name) {
      onClose();
      await onSubmit?.(name);
    } else {
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="w-[420px] space-y-6 p-5"
        onClick={(e) => e.stopPropagation()}
        hideClose
        noTitle
      >
        <div className="relative flex w-full flex-col items-center gap-2 self-stretch">
          <div className="flex items-center">
            <CircleAlert className="size-9 flex-shrink-0 p-1 text-red" />
          </div>
          <div className="text-center text-lg/[22px] font-semibold">
            Delete this entire workspace permanently?
          </div>
          <div className="text-center text-xs/4 text-wrap text-secondary">
            This action cannot be undone. This will permanently delete the
            workspace, including all pages and files. Please type the name of
            the workspace to confirm.
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex w-full flex-col"
            style={{ marginTop: 0 }}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <Input placeholder={name} {...field} className="h-9" />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.formState.errors.name && (
              <div className="mt-1 text-xs/5 text-red">
                {`Please type "${name}" to continue`}
              </div>
            )}
            <Button
              type="submit"
              variant="red-fill"
              size="sm"
              className="mt-6 w-full"
              disabled={form.formState.isSubmitting}
            >
              Permanently delete workspace
            </Button>
            <div className="flex justify-center">
              <Button
                onClick={onClose}
                variant="hint"
                size="sm"
                className="mt-3 h-7 w-fit"
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
