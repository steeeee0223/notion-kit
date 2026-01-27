"use client";

import { useState } from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Button, Dialog, DialogTrigger, Switch } from "@notion-kit/shadcn";

import { SettingsRule, SettingsSection } from "../../core";
import { useAccount, useAccountActions } from "../hooks";
import { DeleteAccount } from "../modals";

export function SupportSection() {
  /** i18n */
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const trans = t("support", { returnObjects: true });
  /** handlers */
  const { data: account } = useAccount();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { remove } = useAccountActions();

  return (
    <SettingsSection title={trans.title}>
      <SettingsRule {...trans.support}>
        <Switch size="sm" />
      </SettingsRule>
      <SettingsRule
        {...trans.delete}
        className="**:data-[slot=settings-rule-title]:text-red"
      >
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="hint" className="size-5">
              <Icon.ChevronRight className="size-3 fill-default/35" />
            </Button>
          </DialogTrigger>
          <DeleteAccount
            email={account.email}
            onSubmit={async (email) => {
              await remove({ accountId: account.id, email });
              setDeleteOpen(false);
            }}
          />
        </Dialog>
      </SettingsRule>
    </SettingsSection>
  );
}
