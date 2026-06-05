import React, { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod/v4";

import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Role, type User } from "@notion-kit/schemas";
import {
  Badge,
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
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
  Dialog,
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
  MenuItemAction,
  MenuLabel,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  Separator,
  Spinner,
  Textarea,
} from "@notion-kit/ui/primitives";

import { Avatar } from "@/presets/_components";

const emailSchema = z.email();
const addMembersSchema = z.object({
  _emailInput: z.string(),
  emails: z.array(emailSchema).min(1),
  role: z.enum([Role.OWNER, Role.MEMBER]),
  message: z.string().optional(),
});
type AddMembersSchema = z.infer<typeof addMembersSchema>;

type DetailedAccount = User & { invited?: boolean; creatable?: boolean };

interface GroupOption {
  label: string;
  items: DetailedAccount[];
}

interface AddMembersProps {
  invitedMembers: User[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: AddMembersSchema) => Promise<void>;
}

export function AddMembers({
  invitedMembers,
  open,
  onOpenChange,
  onAdd,
}: AddMembersProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-members",
  });

  const form = useForm<AddMembersSchema>({
    resolver: zodResolver(addMembersSchema),
    defaultValues: {
      _emailInput: "",
      emails: [],
      role: Role.OWNER,
      message: "",
    },
  });

  /** Actions */
  const invite = form.handleSubmit(async (values) => {
    await onAdd?.(values);
    onClose();
  });

  const onClose = () => {
    onOpenChange?.(false);
    form.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (nextOpen ? onOpenChange?.(true) : onClose())}
    >
      <DialogContent hideClose className="w-115">
        <DialogHeader>
          <DialogIcon>
            <Icon.InviteMemberSmall className="size-9 fill-icon" />
          </DialogIcon>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription typography="h3" className="text-muted">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={invite} className="space-y-4">
            <EmailsField invitedMembers={invitedMembers} />
            <Separator />
            <RolesField />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("message-label")}</FormLabel>
                  <FormControl
                    render={
                      <Textarea
                        placeholder={t("message-placeholder")}
                        {...field}
                      />
                    }
                  />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                variant="blue"
                size="sm"
                className="w-full"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {t("invite")}
                {form.formState.isSubmitting && <Spinner />}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="hint"
                  size="sm"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {t("cancel")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface EmailsFieldProps {
  invitedMembers: User[];
}

function EmailsField({ invitedMembers }: EmailsFieldProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-members",
  });

  const { control, setValue } = useFormContext<AddMembersSchema>();
  const [inputValue, emails] = useWatch({
    control,
    name: ["_emailInput", "emails"],
  });

  const multiSelectOptions = useMemo<GroupOption[]>(() => {
    const accounts = invitedMembers.map<DetailedAccount>((account) => ({
      ...account,
      invited: true,
    }));
    const normalizedSearch = inputValue.trim();
    const isSearchEmail = emailSchema.safeParse(normalizedSearch).success;
    const creatableEmail =
      isSearchEmail && !emails.some((email) => email === normalizedSearch);
    const hasExactAccount = accounts.some(
      (account) => account.email === normalizedSearch,
    );
    const typedAccount =
      normalizedSearch.length > 0 && !hasExactAccount
        ? [
            {
              id: normalizedSearch,
              email: normalizedSearch,
              name: normalizedSearch,
              avatarUrl: "",
              creatable: creatableEmail,
            },
          ]
        : [];

    return [
      {
        label: isSearchEmail ? t("headings.select") : t("headings.type"),
        items: [...typedAccount, ...accounts],
      },
    ];
  }, [emails, inputValue, invitedMembers, t]);

  return (
    <FormField
      control={control}
      name="emails"
      render={({ field }) => (
        <FormItem>
          <FormControl
            render={
              <Combobox<DetailedAccount, true>
                multiple
                value={field.value.map((email) => ({
                  id: email,
                  email,
                  name: email,
                  avatarUrl: "",
                }))}
                inputValue={inputValue}
                onInputValueChange={(value) => setValue("_emailInput", value)}
                onValueChange={(values) => {
                  field.onChange(values.map((v) => v.email));
                  setValue("_emailInput", "");
                }}
                items={multiSelectOptions}
                itemToStringLabel={(option) => option.name}
                itemToStringValue={(option) => option.email}
                isItemEqualToValue={(item, value) => item.email === value.email}
              >
                <ComboboxChips hideClearButton className="w-full py-1 pl-2">
                  <ComboboxValue>
                    {(selectedValue: DetailedAccount[]) => (
                      <>
                        {selectedValue.map((account) => (
                          <ComboboxChip key={account.email}>
                            {account.email}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          type="email"
                          placeholder={
                            selectedValue.length === 0
                              ? t("search-placeholder")
                              : ""
                          }
                          autoComplete="off"
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent>
                  <ComboboxEmpty>{t("empty")}</ComboboxEmpty>
                  <ComboboxList>
                    {(group: GroupOption) => (
                      <ComboboxGroup key={group.label} items={group.items}>
                        <ComboboxLabel title={group.label} />
                        <ComboboxCollection>
                          {(user: DetailedAccount) => (
                            <ComboboxItem
                              key={user.id}
                              value={user.email}
                              disabled={
                                user.invited === true || !user.creatable
                              }
                              label={user.invited ? user.name : user.email}
                              icon={
                                user.invited ? (
                                  <Avatar
                                    src={user.avatarUrl}
                                    fallback={user.name}
                                  />
                                ) : user.creatable ? (
                                  <Avatar fallback={user.email} />
                                ) : (
                                  <Icon.Envelope />
                                )
                              }
                            >
                              {user.invited && (
                                <MenuItemAction>
                                  <Badge
                                    variant="gray"
                                    size="sm"
                                    className="ml-auto tracking-wide uppercase"
                                  >
                                    {t("invited-badge")}
                                  </Badge>
                                </MenuItemAction>
                              )}
                            </ComboboxItem>
                          )}
                        </ComboboxCollection>
                      </ComboboxGroup>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            }
          />
        </FormItem>
      )}
    />
  );
}

function RolesField() {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-members",
  });

  const { control } = useFormContext<AddMembersSchema>();
  const selectedRole = useWatch({ control, name: "role" });
  const roleOptions: Record<AddMembersSchema["role"], RoleOption> = {
    [Role.OWNER]: {
      label: t("role-options.owner.label"),
      description: t("role-options.owner.description"),
      icon: <Icon.PersonWithKey className="size-5 fill-current" />,
    },
    [Role.MEMBER]: {
      label: t("role-options.member.label"),
      description: t("role-options.member.description"),
      icon: <Icon.Person className="size-5 fill-current" />,
    },
  };

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
                value={field.value}
                onValueChange={field.onChange}
                disabled={field.disabled}
              >
                <SelectTrigger className="h-auto rounded-md border border-border p-3 text-left">
                  <RoleOption option={roleOptions[selectedRole]} />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  align="start"
                  className="w-(--radix-select-trigger-width)"
                >
                  <SelectGroup>
                    <MenuLabel>{t("role-label")}</MenuLabel>
                    {Object.entries(roleOptions).map(([value, option]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        Icon={option.icon}
                        textValue={option.label}
                      >
                        <div className="space-y-1 whitespace-normal">
                          <div className="text-sm">{option.label}</div>
                          <div className="text-xs text-secondary">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
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
  description: string;
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
          {option.description}
        </div>
      </div>
    </div>
  );
}
