"use client";

import { useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { Button, Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../../core";
import { EmailSettings, PasswordForm } from "../../modals";

export function SecuritySection() {
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const trans = t("account-security", { returnObjects: true });
  /** Handlers */
  const {
    settings: { account },
    updateSettings: update,
    account: actions,
  } = useSettings();
  const { openModal } = useModal();
  const setEmail = () =>
    openModal(
      <EmailSettings
        email={account.email}
        onSendVerification={() =>
          actions?.sendEmailVerification?.(account.email)
        }
      />,
    );
  const setPassword = () =>
    openModal(
      <PasswordForm
        hasPassword={account.hasPassword}
        onSubmit={async (newPassword, currentPassword) => {
          await update?.({ account: { hasPassword: true } });
          if (currentPassword) {
            await actions?.changePassword?.({ newPassword, currentPassword });
          } else {
            await actions?.setPassword?.(newPassword);
          }
        }}
      />,
    );

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule title={trans.email.title} description={account.email}>
        <Button size="sm" onClick={setEmail}>
          {trans.email.button}
        </Button>
      </SettingsRule>
      <SettingsRule {...trans.password}>
        {account.hasPassword ? (
          <Button size="sm" onClick={setPassword}>
            {trans.password.button}
          </Button>
        ) : (
          <Switch size="sm" onCheckedChange={setPassword} checked={false} />
        )}
      </SettingsRule>
      <SettingsRule {...trans.verification}>
        <Button size="sm" onClick={setPassword} disabled>
          {trans.verification.button}
        </Button>
      </SettingsRule>
      <SettingsRule {...trans.passkeys}>
        <Button size="sm" onClick={setPassword} disabled>
          {trans.passkeys.button}
        </Button>
      </SettingsRule>
    </SettingsSection>
  );
}
