"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleHelp } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { IconBlock } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import { useModal } from "@notion-kit/modal";
import { IconObject } from "@notion-kit/schemas";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Label,
  Textarea,
} from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

import { HintButton } from "../../_components";
import { PermissionSelect } from "./permission-select";

const createTeamspaceSchema = z.object({
  name: z.string().min(1),
  icon: IconObject,
  description: z.string().max(500).optional(),
  permission: z.enum(["default", "open", "closed", "private"]),
});
type CreateTeamspaceSchema = z.infer<typeof createTeamspaceSchema>;

interface CreateTeamspaceProps {
  workspace: string;
  onSubmit?: (values: CreateTeamspaceSchema) => Promise<void>;
}

export function CreateTeamspace({
  workspace,

  onSubmit,
}: CreateTeamspaceProps) {
  const { isOpen, closeModal } = useModal();

  const form = useForm<CreateTeamspaceSchema>({
    resolver: zodResolver(createTeamspaceSchema),
    defaultValues: {
      name: "",
      icon: { type: "text", src: "T" },
      permission: "open",
    },
  });
  const { formState, handleSubmit } = form;
  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values);
  });

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        className="w-120 p-6 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="items-start">
          <DialogTitle typography="h2">Create a new teamspace</DialogTitle>
          <DialogDescription typography="desc" className="text-start">
            Teamspaces are where your team organizes pages, permissions, and
            members
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={submit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <Label>Icon & name</Label>
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <IconMenu
                          disabled={field.disabled}
                          onSelect={field.onChange}
                          onRemove={() =>
                            field.onChange({ type: "text", src: "T" })
                          }
                          onUpload={(file) =>
                            field.onChange({
                              type: "url",
                              src: URL.createObjectURL(file),
                            })
                          }
                        >
                          <IconBlock icon={field.value} size="sm" />
                        </IconMenu>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          data-size="lg"
                          placeholder="Acme Labs"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Details about your teamspace"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <FormControl>
                    <PermissionSelect workspace={workspace} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="flex-row justify-between">
              <HintButton
                icon={CircleHelp}
                label="Learn about teamspaces"
                href="https://www.notion.com/help/guides/teamspaces-give-teams-home-for-important-work"
              />
              <Button
                type="submit"
                variant="blue"
                size="md"
                disabled={formState.isSubmitting || !formState.isValid}
              >
                {formState.isSubmitting && <Spinner />}
                Create teamspace
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
