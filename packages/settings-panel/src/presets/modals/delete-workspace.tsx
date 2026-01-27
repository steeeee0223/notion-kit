"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

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
  FormMessage,
  Input,
} from "@notion-kit/shadcn";

const workspaceSchema = z.object({
  name: z.string(),
});
type WorkspaceSchema = z.infer<typeof workspaceSchema>;

interface DeleteWorkspaceProps {
  name: string;
  onSubmit?: (name: string) => void | Promise<void>;
}

export function DeleteWorkspace({ name, onSubmit }: DeleteWorkspaceProps) {
  const form = useForm<WorkspaceSchema>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "" },
  });

  const submit = async (value: WorkspaceSchema) => {
    if (value.name === name) {
      await onSubmit?.(name);
    } else {
      form.reset();
    }
  };

  return (
    <DialogContent className="w-[420px] p-5">
      <DialogHeader>
        <DialogIcon>
          <CircleAlert className="size-9 text-red" />
        </DialogIcon>
        <DialogTitle typography="h2">
          Delete this entire workspace permanently?
        </DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the
          workspace, including all pages and files. Please type the name of the
          workspace to confirm.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={name} {...field} data-size="lg" />
                </FormControl>
              </FormItem>
            )}
          />
          {form.formState.errors.name && (
            <FormMessage>{`Please type "${name}" to continue`}</FormMessage>
          )}
          <DialogFooter>
            <Button
              type="submit"
              variant="red-fill"
              size="sm"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Permanently delete workspace
            </Button>
            <DialogClose asChild>
              <Button
                variant="hint"
                size="sm"
                className="h-7 w-fit"
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
