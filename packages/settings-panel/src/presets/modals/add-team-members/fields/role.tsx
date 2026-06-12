import { useFormContext } from "react-hook-form";

import { useTranslation } from "@notion-kit/i18n";
import {
  FormControl,
  FormField,
  FormItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import type { TeamMembersFormSchema } from "./use-add-team-members-form";

export function RoleField() {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-team-members",
  });
  const options = [
    { value: "owner", label: t("roles.owner") },
    { value: "member", label: t("roles.member") },
  ];

  const { control } = useFormContext<TeamMembersFormSchema>();

  return (
    <FormField
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem className="sticky top-0 ml-2 w-auto shrink-0 py-0.5">
          <FormControl
            render={
              <Select
                items={options}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="mb-0 w-[170px] text-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {options.map((option) => (
                      <SelectItem key={option.value} {...option} />
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            }
          />
        </FormItem>
      )}
    />
  );
}
