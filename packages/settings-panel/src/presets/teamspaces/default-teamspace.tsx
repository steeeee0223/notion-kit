import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { useTranslation } from "@notion-kit/i18n";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  Form,
  FormControl,
  FormField,
  FormItem,
  Spinner,
} from "@notion-kit/ui/primitives";

import { useTeamspaceOptions, type TeamspaceOption } from "./use-teamspaces";

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
              <FormControl
                render={
                  <Combobox<TeamspaceOption, true>
                    multiple
                    disabled={field.disabled}
                    value={teamspaceOptions.filter(
                      (option) => option.id === field.value,
                    )}
                    onValueChange={(options) => {
                      const last = options.at(-1);
                      field.onChange(last?.id ?? "");
                    }}
                    items={teamspaceOptions}
                    itemToStringLabel={(option) => option.name}
                    itemToStringValue={(option) => option.name}
                    isItemEqualToValue={(item, value) =>
                      item.name === value.name
                    }
                  >
                    <ComboboxChips
                      hideClearButton
                      className="w-full cursor-text py-1 pl-2"
                    >
                      <ComboboxValue>
                        {(selected: TeamspaceOption[]) => (
                          <>
                            {selected.map((option) => (
                              <ComboboxChip
                                key={option.id}
                                style={{ backgroundColor: option.color }}
                              >
                                {option.name}
                              </ComboboxChip>
                            ))}
                            <ComboboxChipsInput />
                          </>
                        )}
                      </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent>
                      <ComboboxEmpty>No results found</ComboboxEmpty>
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxCollection>
                            {(option: TeamspaceOption) => (
                              <ComboboxItem
                                key={option.id}
                                value={option}
                                icon={<IconBlock icon={option.icon} />}
                                label={option.name}
                              />
                            )}
                          </ComboboxCollection>
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                }
              />
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
