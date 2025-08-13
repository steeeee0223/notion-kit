"use client";

import { IconBlock } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

import { useCreateWorkspaceForm } from "./use-create-workspace-form";

export function CreateWorkspaceForm() {
  const { form, uploadIcon, removeIcon, submit } = useCreateWorkspaceForm();

  return (
    <div className="flex flex-col items-center gap-20">
      <div className="relative flex max-w-130 flex-col text-center">
        <div className="text-[22px] font-semibold text-primary">
          Give your workspace a name
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={submit} className="w-75 space-y-8">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <IconMenu
                    disabled={field.disabled}
                    onSelect={field.onChange}
                    onRemove={removeIcon}
                    onUpload={uploadIcon}
                  >
                    <IconBlock icon={field.value} size="lg" />
                  </IconMenu>
                </FormControl>
                <FormDescription>Choose or add an icon</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." data-size="lg" {...field} />
                </FormControl>
                <FormDescription>
                  The name of your company or organization
                </FormDescription>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="blue"
            size="md"
            className="w-full gap-1"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting && <Spinner />}
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}
