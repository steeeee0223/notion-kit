"use client";

import { ChevronRight } from "lucide-react";

import { useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { Button, Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { DeleteAccount } from "../modals";

export function SupportSection() {
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const trans = t("support", { returnObjects: true });
  /** handlers */
  const {
    settings: { account },
    account: actions,
  } = useSettings();
  const { openModal } = useModal();
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
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.support}>
        <Switch size="sm" />
      </SettingsRule>
      <SettingsRule
        {...trans.delete}
        className="**:data-[slot=settings-rule-title]:text-red"
      >
        <Button variant="hint" className="size-5" onClick={deleteAccount}>
          <ChevronRight className="size-4 text-default/35" />
        </Button>
      </SettingsRule>
    </SettingsSection>
  );
}
