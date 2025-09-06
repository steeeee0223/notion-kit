"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { useTranslation } from "@notion-kit/i18n";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  MultiSelect,
} from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

import { useTeamspaceOptions } from "./use-teamspaces";

const defaultTeamspaceFormSchema = z.object({
  id: z.string(),
});
type DefaultTeamspaceFormSchema = z.infer<typeof defaultTeamspaceFormSchema>;

export function DefaultTeamspace() {
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("teamspaces.teamspaces.default", { returnObjects: true });
  /** form */
  const teamspaceOptions = useTeamspaceOptions();
  const form = useForm<DefaultTeamspaceFormSchema>({
    resolver: zodResolver(defaultTeamspaceFormSchema),
    defaultValues: { id: "" },
  });
  const { formState, handleSubmit } = form;
  const submit = handleSubmit(async (values) => {
    // TODO update default teamspace
    console.log("set default teamspace to", values.id);
    await Promise.resolve();
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="flex w-full items-center gap-2.5">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem className="min-w-0 grow">
              <FormControl>
                <MultiSelect
                  options={teamspaceOptions}
                  value={teamspaceOptions.filter(
                    (option) => option.id === field.value,
                  )}
                  onChange={(options) => field.onChange(options.at(0)?.id)}
                  disabled={field.disabled}
                  maxSelected={1}
                  hideClearAllButton
                  emptyIndicator="No results found"
                  renderOption={({ option }) => (
                    <>
                      <div className="mr-2.5 flex items-center justify-center">
                        <IconBlock
                          icon={JSON.parse(option.icon as string) as IconData}
                        />
                      </div>
                      <div className="mr-3 min-w-0 flex-auto truncate">
                        {option.label}
                      </div>
                    </>
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="blue"
          size="sm"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          {form.formState.isSubmitting && <Spinner />}
          {trans.button}
        </Button>
      </form>
    </Form>
  );
}
