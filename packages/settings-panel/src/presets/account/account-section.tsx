"use client";

import { useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { useHover } from "usehooks-ts";

import { cn } from "@notion-kit/cn";
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

import { SettingsSection } from "../../core";
import { useAccount, useAccountActions, useFileActions } from "../hooks";

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
  const { data: account } = useAccount();
  const { update } = useAccountActions();
  const { upload } = useFileActions();
  const updateAvatar = () => avatarInputRef.current?.click();
  const [isPending, startTransition] = useTransition();
  const removeAvatar = () =>
    startTransition(async () => await update({ avatarUrl: "" }));
  const uploadAvatar = () =>
    startTransition(async () => {
      const file = avatarInputRef.current?.files?.[0];
      if (file) await upload(file);
    });

  const [preferredName, setPreferredName] = useState(account.preferredName);
  const updatePreferredName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPreferredName(e.target.value);
  const savePreferredName = () => {
    if (preferredName !== account.preferredName) {
      void update({ preferredName });
    }
  };

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
                  className="size-15"
                  onClick={updateAvatar}
                >
                  <AvatarImage src={account.avatarUrl} />
                  <AvatarFallback className="text-2xl uppercase">
                    {account.preferredName.at(0) ?? ""}
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
                  aria-disabled={isPending}
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
              onChange={uploadAvatar}
              disabled={isPending}
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
              value={preferredName}
              onChange={updatePreferredName}
              onBlur={savePreferredName}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                savePreferredName();
              }}
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
