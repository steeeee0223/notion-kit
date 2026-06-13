import { useFormContext } from "react-hook-form";

import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Role } from "@notion-kit/schemas";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import type { AddMembersSchema } from "./types";

export function RolesField() {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-members",
  });

  const { control } = useFormContext<AddMembersSchema>();

  const roleOptions = [
    {
      value: Role.OWNER,
      label: t("role-options.owner.label"),
      desc: t("role-options.owner.description"),
      icon: <Icon.PersonWithKey className="size-5 fill-current" />,
    },
    {
      value: Role.MEMBER,
      label: t("role-options.member.label"),
      desc: t("role-options.member.description"),
      icon: <Icon.Person className="size-5 fill-current" />,
    },
  ];

  return (
    <FormField
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("role-label")}</FormLabel>
          <FormControl
            render={
              <Select
                items={roleOptions}
                value={field.value}
                onValueChange={field.onChange}
                disabled={field.disabled}
              >
                <SelectTrigger className="h-auto rounded-md border border-border p-3 text-left">
                  <SelectValue>
                    {(value: Role) => (
                      <RoleOption
                        option={
                          roleOptions.find((option) => option.value === value)!
                        }
                      />
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  className="w-(--anchor-width)"
                >
                  <SelectGroup>
                    <SelectLabel title={t("role-label")} />
                    {roleOptions.map((option) => (
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

interface RoleOption {
  label: string;
  desc: string;
  icon: React.ReactNode;
}

interface RoleOptionProps {
  option: RoleOption;
}

function RoleOption({ option }: RoleOptionProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-icon">
        {option.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-primary">{option.label}</div>
        <div className="text-xs whitespace-normal text-secondary">
          {option.desc}
        </div>
      </div>
    </div>
  );
}
