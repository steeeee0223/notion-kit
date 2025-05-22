"use client";

import React, { useRef } from "react";
import { ChevronRight, X } from "lucide-react";
import { useHover } from "usehooks-ts";

import { cn } from "@notion-kit/cn";
import { useTransition } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Label,
  Switch,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { DeleteAccount, EmailSettings, PasswordForm } from "../modals";

export const Account = () => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLSpanElement>(null);
  const avatarIsHover = useHover(avatarRef as React.RefObject<HTMLElement>);
  const avatarCancelRef = useRef<HTMLButtonElement>(null);
  const avatarCancelIsHover = useHover(
    avatarCancelRef as React.RefObject<HTMLElement>,
  );
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const accountTexts = t("account", { returnObjects: true });
  const securityTexts = t("account-security", { returnObjects: true });
  const supportTexts = t("support", { returnObjects: true });
  const devicesTexts = t("devices", { returnObjects: true });
  /** Handlers */
  const {
    settings: { account },
    updateSettings: update,
    uploadFile,
    account: actions,
  } = useSettings();
  const updateAvatar = () => avatarInputRef.current?.click();
  const [removeAvatar, isRemoving] = useTransition(() =>
    update?.({ account: { avatarUrl: "" } }),
  );
  const [selectImage, isUploading] = useTransition(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) await uploadFile?.(file);
    },
  );
  const updateName = (e: React.ChangeEvent<HTMLInputElement>) =>
    update?.({ account: { preferredName: e.target.value } });
  /** Modals */
  const { openModal } = useModal();
  const setEmail = () => openModal(<EmailSettings email={account.email} />);
  const setPassword = () =>
    openModal(
      <PasswordForm
        hasPassword={account.hasPassword}
        onSubmit={() => update?.({ account: { hasPassword: true } })}
      />,
    );
  const deleteAccount = () =>
    openModal(
      <DeleteAccount
        email={account.email}
        onSubmit={(email) =>
          actions?.delete?.({ accountId: account.id, email })
        }
      />,
    );

  return (
    <div className="space-y-12">
      <SettingsSection title={accountTexts.title}>
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="relative">
              <TooltipPreset
                description={
                  accountTexts[
                    avatarCancelIsHover ? "remove-photo" : "replace-photo"
                  ]
                }
                sideOffset={12}
              >
                <div>
                  <Avatar
                    ref={avatarRef}
                    className="size-[60px] border border-default/20 select-none"
                    onClick={updateAvatar}
                  >
                    <AvatarImage src={account.avatarUrl} />
                    <AvatarFallback className="bg-default/5 text-2xl">
                      {account.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    ref={avatarCancelRef}
                    onClick={removeAvatar}
                    variant={null}
                    size="circle"
                    className={cn(
                      "absolute -top-0.5 -right-0.5 z-10 flex hidden size-auto border border-border-button bg-main p-1 text-secondary",
                      (avatarIsHover || avatarCancelIsHover) && "block",
                    )}
                    aria-disabled={isRemoving || isUploading}
                  >
                    <X size={8} strokeWidth={2} />
                  </Button>
                </div>
              </TooltipPreset>
              <Input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                accept="image/*"
                onChange={selectImage}
                disabled={isRemoving || isUploading}
              />
            </div>
            <div className="ml-5 w-[250px]">
              <Label
                className="mb-1 block text-xs text-secondary"
                htmlFor="username"
              >
                {accountTexts["preferred-name"]}
              </Label>
              <Input
                type="username"
                id="username"
                value={account.preferredName}
                onChange={updateName}
              />
            </div>
          </div>
        </div>
      </SettingsSection>
      <SettingsSection title={securityTexts.title}>
        <SettingsRule
          title={securityTexts.email.title}
          description={account.email}
        >
          <Button size="sm" onClick={setEmail}>
            {securityTexts.email.button}
          </Button>
        </SettingsRule>
        <SettingsRule {...securityTexts.password}>
          {account.hasPassword ? (
            <Button size="sm" onClick={setPassword}>
              {securityTexts.password.button}
            </Button>
          ) : (
            <Switch size="sm" onCheckedChange={setPassword} checked={false} />
          )}
        </SettingsRule>
        <SettingsRule {...securityTexts.verification}>
          <Button size="sm" onClick={setPassword} disabled>
            {securityTexts.verification.button}
          </Button>
        </SettingsRule>
        <SettingsRule {...securityTexts.passkeys}>
          <Button size="sm" onClick={setPassword} disabled>
            {securityTexts.passkeys.button}
          </Button>
        </SettingsRule>
      </SettingsSection>
      <SettingsSection title={supportTexts.title}>
        <SettingsRule {...supportTexts.support}>
          <Switch size="sm" />
        </SettingsRule>
        <SettingsRule {...supportTexts.delete} titleProps="text-[#eb5757]">
          <Button variant="hint" className="size-5" onClick={deleteAccount}>
            <ChevronRight className="size-4 text-default/35" />
          </Button>
        </SettingsRule>
      </SettingsSection>
      <SettingsSection title={devicesTexts.title}>
        <SettingsRule {...devicesTexts.logout}>
          <Button size="xs" className="text-secondary">
            {devicesTexts.logout.button}
          </Button>
        </SettingsRule>
      </SettingsSection>
    </div>
  );
};
