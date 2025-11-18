"use client";

import { BaseModal } from "@notion-kit/common";
import { useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { Button } from "@notion-kit/shadcn";

import { Content } from "../_components";
import { SettingsSection, useSettings } from "../../core";
import { Scope } from "../../lib";
import { useAccount, useWorkspace, useWorkspaceActions } from "../hooks";
import { DeleteWorkspace } from "../modals";

export function DangerSection() {
  const { openModal } = useModal();
  const { data: account } = useAccount();
  const { data: workspace } = useWorkspace();
  const { scopes } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.danger", { returnObjects: true });
  const modalsTrans = t("general.modals", { returnObjects: true });
  /** handlers */
  const { remove, leave } = useWorkspaceActions();
  const deleteWorkspace = () =>
    openModal(
      <DeleteWorkspace
        name={workspace.name}
        onSubmit={() => remove(workspace.id)}
      />,
    );
  const leaveWorkspace = () =>
    openModal(
      <BaseModal {...modalsTrans.leave} onTrigger={() => leave(account.id)} />,
    );

  return (
    <SettingsSection title={trans.title}>
      {scopes.has(Scope.WorkspaceUpdate) ? (
        <Content
          hint={trans.hint}
          href="https://www.notion.com/help/create-delete-and-switch-workspaces#delete-workspace"
        >
          <Button variant="red" size="sm" onClick={deleteWorkspace}>
            {trans.delete}
          </Button>
        </Content>
      ) : (
        <Content>
          <Button variant="red" size="sm" onClick={leaveWorkspace}>
            {trans.leave}
          </Button>
        </Content>
      )}
    </SettingsSection>
  );
}
