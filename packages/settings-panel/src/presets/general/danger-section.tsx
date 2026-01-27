"use client";

import { useState } from "react";

import { AlertModal } from "@notion-kit/common/alert-modal";
import { useTranslation } from "@notion-kit/i18n";
import { Button, Dialog, DialogTrigger } from "@notion-kit/shadcn";

import { Content } from "../_components";
import { SettingsSection, useSettings } from "../../core";
import { Scope } from "../../lib";
import { useAccount, useWorkspace, useWorkspaceActions } from "../hooks";
import { DeleteWorkspace } from "../modals";

export function DangerSection() {
  const { data: account } = useAccount();
  const { data: workspace } = useWorkspace();
  const { scopes } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.danger", { returnObjects: true });
  const modalsTrans = t("general.modals", { returnObjects: true });
  /** handlers */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { remove, leave } = useWorkspaceActions();

  return (
    <SettingsSection title={trans.title}>
      {scopes.has(Scope.WorkspaceUpdate) ? (
        <>
          <Content
            hint={trans.hint}
            href="https://www.notion.com/help/create-delete-and-switch-workspaces#delete-workspace"
          >
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="red" size="sm">
                  {trans.delete}
                </Button>
              </DialogTrigger>
              <DeleteWorkspace
                name={workspace.name}
                onSubmit={async () => {
                  await remove(workspace.id);
                  setDeleteOpen(false);
                }}
              />
            </Dialog>
          </Content>
        </>
      ) : (
        <Dialog>
          <Content>
            <DialogTrigger asChild>
              <Button variant="red" size="sm">
                {trans.leave}
              </Button>
            </DialogTrigger>
          </Content>
          <AlertModal
            {...modalsTrans.leave}
            onTrigger={() => leave(account.id)}
          />
        </Dialog>
      )}
    </SettingsSection>
  );
}
