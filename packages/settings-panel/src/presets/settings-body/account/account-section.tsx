"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { useHover } from "usehooks-ts";

import { cn } from "@notion-kit/cn";
import { useTransition } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Label,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { SettingsSection, useSettings } from "../../../core";

export function AccountSection() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLSpanElement>(null);
  const avatarIsHover = useHover(avatarRef as React.RefObject<HTMLElement>);
  const avatarCancelRef = useRef<HTMLButtonElement>(null);
  const avatarCancelIsHover = useHover(
    avatarCancelRef as React.RefObject<HTMLElement>,
  );
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const trans = t("account", { returnObjects: true });
  /** handlers */
  const {
    settings: { account },
    updateSettings: update,
    uploadFile,
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

  return (
    <SettingsSection title={trans.title}>
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="relative">
            <TooltipPreset
              description={
                trans[avatarCancelIsHover ? "remove-photo" : "replace-photo"]
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
                    {account.name.at(0) ?? ""}
                  </AvatarFallback>
                </Avatar>
                <Button
                  ref={avatarCancelRef}
                  onClick={removeAvatar}
                  variant={null}
                  size="circle"
                  className={cn(
                    "absolute -top-0.5 -right-0.5 z-10 hidden size-auto border border-border-button bg-main p-1 text-secondary",
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
              {trans["preferred-name"]}
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
  );
}
