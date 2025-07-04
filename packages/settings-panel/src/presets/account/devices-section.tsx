"use client";

import { useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { Button } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { LogoutConfirm } from "../modals";
import { SessionsTable } from "../tables";

export function DevicesSection() {
  const { openModal } = useModal();
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const trans = t("devices", { returnObjects: true });
  /** handlers */
  const { settings, account: actions } = useSettings();
  const { currentSessionId, sessions } = settings.account;
  const openLogoutAllConfirmModal = () =>
    openModal(
      <LogoutConfirm
        title="Log out of all devices?"
        description="You will be logged out of all other active sessions on other devices except this one."
        onConfirm={actions?.logoutAll}
      />,
    );
  const openLogoutConfirmModal = (deviceName: string, token: string) =>
    openModal(
      <LogoutConfirm
        title={`Log out of ${deviceName}?`}
        description="You will be logged out of this device."
        onConfirm={() => actions?.logoutSession?.(token)}
      />,
    );

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.logout}>
        <Button
          size="xs"
          className="text-secondary"
          onClick={openLogoutAllConfirmModal}
        >
          {trans.logout.button}
        </Button>
      </SettingsRule>
      <SessionsTable
        currentSessionId={currentSessionId}
        data={sessions}
        onLogout={openLogoutConfirmModal}
      />
    </SettingsSection>
  );
}
