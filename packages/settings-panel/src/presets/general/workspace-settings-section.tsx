"use client";

import { useInputField } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import { IconBlock } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import { Input } from "@notion-kit/shadcn";

import { Content } from "../_components";
import { SettingsSection } from "../../core";
import { useFileActions, useWorkspace, useWorkspaceActions } from "../hooks";

export function WorkspaceSettingsSection() {
  const { data: workspace } = useWorkspace();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.workspace", { returnObjects: true });
  /** handlers */
  const { update, updateIcon, isUpdatingIcon } = useWorkspaceActions();
  const { isUploading, upload } = useFileActions();
  const { props: nameProps } = useInputField({
    id: "workspace-name",
    initialValue: workspace.name,
    onUpdate: (name) => void update({ name }),
  });

  return (
    <SettingsSection title={trans.title}>
      <Content {...trans.name}>
        <Input {...nameProps} />
      </Content>
      <Content {...trans.icon}>
        <IconMenu
          disabled={isUpdatingIcon || isUploading}
          onSelect={updateIcon}
          onRemove={() => updateIcon({ type: "text", src: workspace.name })}
          onUpload={upload}
        >
          <IconBlock icon={workspace.icon} size="lg" />
        </IconMenu>
      </Content>
    </SettingsSection>
  );
}
