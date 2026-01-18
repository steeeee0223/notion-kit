"use client";

import { useTranslation } from "@notion-kit/i18n";
import { Button, Dialog, DialogTrigger } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";
import { useAccount } from "../hooks";
import { LogoutConfirm } from "../modals";
import { SessionsTable } from "../tables";
import { useSessions } from "./use-sessions";

export function DevicesSection() {
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const trans = t("devices", { returnObjects: true });
  /** handlers */
  const { data: account } = useAccount();
  const { sessions, revoke, revokeOthers } = useSessions();

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.logout}>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="xs" className="text-secondary">
              {trans.logout.button}
            </Button>
          </DialogTrigger>
          <LogoutConfirm
            title="Log out of all devices?"
            description="You will be logged out of all other active sessions on other devices except this one."
            onConfirm={revokeOthers}
          />
        </Dialog>
      </SettingsRule>
      <SessionsTable
        currentSessionId={account.currentSessionId}
        data={sessions}
        onLogout={revoke}
      />
    </SettingsSection>
  );
}
