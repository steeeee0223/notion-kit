"use client";

import { useTransition } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import { Button } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../../core";
import { SessionsTable } from "../../sessions";

export function DevicesSection() {
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const trans = t("devices", { returnObjects: true });
  /** handlers */
  const { settings, account: actions } = useSettings();
  const { currentSessionId, sessions } = settings.account;
  const [logoutAll, isLoggingOutAll] = useTransition(() =>
    actions?.logoutAll?.(),
  );
  const [logoutSession] = useTransition((token: string) =>
    actions?.logoutSession?.(token),
  );

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.logout}>
        <Button
          size="xs"
          className="text-secondary"
          onClick={logoutAll}
          aria-disabled={isLoggingOutAll}
        >
          {trans.logout.button}
        </Button>
      </SettingsRule>
      <SessionsTable
        currentSessionId={currentSessionId}
        data={sessions}
        onLogout={logoutSession}
      />
    </SettingsSection>
  );
}
