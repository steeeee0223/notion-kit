"use client";

import { useState } from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Dialog, DialogTrigger, Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";
import { useAccount, useAccountActions } from "../hooks";
import { EmailSettings, PasskeysModal, PasswordForm } from "../modals";

export function SecuritySection() {
  const [passwordOpen, setPasswordOpen] = useState(false);

  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const trans = t("account-security", { returnObjects: true });
  /** Handlers */
  const { data: account } = useAccount();
  const { sendEmailVerification, changePassword, setPassword } =
    useAccountActions();

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule title={trans.email.title} description={account.email}>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">{trans.email.button}</Button>
          </DialogTrigger>
          <EmailSettings
            email={account.email}
            onSendVerification={() => sendEmailVerification(account.email)}
          />
        </Dialog>
      </SettingsRule>
      <SettingsRule {...trans.password}>
        {account.hasPassword ? (
          <Button size="sm" onClick={() => setPasswordOpen(true)}>
            {trans.password.button}
          </Button>
        ) : (
          <Switch
            size="sm"
            onCheckedChange={() => setPasswordOpen(true)}
            checked={false}
          />
        )}
      </SettingsRule>
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <PasswordForm
          hasPassword={account.hasPassword}
          onSubmit={async (newPassword, currentPassword) => {
            if (currentPassword) {
              await changePassword({ newPassword, currentPassword });
            } else {
              await setPassword(newPassword);
            }
          }}
        />
      </Dialog>
      <SettingsRule {...trans.verification}>
        <Button size="sm" disabled>
          {trans.verification.button}
        </Button>
      </SettingsRule>
      <SettingsRule {...trans.passkeys}>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">{trans.passkeys.button}</Button>
          </DialogTrigger>
          <PasskeysModal />
        </Dialog>
      </SettingsRule>
    </SettingsSection>
  );
}
