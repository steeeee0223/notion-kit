"use client";

import { useInputField, useTransition } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import { Input } from "@notion-kit/shadcn";

import { Content } from "../_components";
import { SettingsSection, useSettings } from "../../core";

export function WorkspaceSettingsSection() {
  const {
    settings: { workspace },
    uploadFile,
    workspace: actions,
  } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const trans = t("general.workspace", { returnObjects: true });
  /** handlers */
  const { props: nameProps } = useInputField({
    id: "workspace-name",
    initialValue: workspace.name,
    onUpdate: (name) => void actions?.update?.({ name }),
  });
  const [updateIcon, isUpdatingIcon] = useTransition((icon: IconData) =>
    actions?.update?.({ icon }),
  );
  const [removeIcon, isRemoving] = useTransition(() =>
    actions?.update?.({ icon: { type: "text", src: workspace.name } }),
  );
  const [uploadIcon, isUploading] = useTransition((file: File) =>
    uploadFile?.(file),
  );

  return (
    <SettingsSection title={trans.title}>
      <Content {...trans.name}>
        <Input {...nameProps} />
      </Content>
      <Content {...trans.icon}>
        <IconMenu
          disabled={isUpdatingIcon || isRemoving || isUploading}
          onSelect={updateIcon}
          onRemove={removeIcon}
          onUpload={uploadIcon}
        >
          <IconBlock icon={workspace.icon} size="lg" />
        </IconMenu>
      </Content>
    </SettingsSection>
  );
}
