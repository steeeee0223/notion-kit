"use client";

import React from "react";

import { useTransition } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import { IconBlock } from "@notion-kit/icon-block";
import { IconMenu } from "@notion-kit/icon-menu";
import { useModal } from "@notion-kit/modal";
import type { IconData } from "@notion-kit/schemas";
import { Button, Input, Switch } from "@notion-kit/shadcn";

import { Content, TextLinks } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { DeleteWorkspace } from "../modals";

export function General() {
  const { openModal } = useModal();
  const {
    settings: { workspace },
    uploadFile,
    workspace: actions,
  } = useSettings();
  // const site = `${workspace.domain}.notion.site`;
  // const link = `www.notion.so/${workspace.domain}`;
  /** i18n */
  const { t } = useTranslation("settings");
  const {
    workspace: workspaceSettings,
    public: publicSettings,
    export: exportSettings,
    analytics,
    danger,
  } = t("general", { returnObjects: true });
  /** Handlers */
  const updateName = (e: React.ChangeEvent<HTMLInputElement>) =>
    actions?.update?.(workspace.id, { name: e.target.value });
  const [updateIcon, isUpdatingIcon] = useTransition((icon: IconData) =>
    actions?.update?.(workspace.id, { icon }),
  );
  const [removeIcon, isRemoving] = useTransition(() =>
    actions?.update?.(workspace.id, {
      icon: { type: "text", src: workspace.name },
    }),
  );
  const [uploadIcon, isUploading] = useTransition((file: File) =>
    uploadFile?.(file),
  );
  // const updateDomain = (e: React.ChangeEvent<HTMLInputElement>) =>
  //   update?.({ workspace: { domain: e.target.value } });
  const deleteWorkspace = () =>
    openModal(
      <DeleteWorkspace
        name={workspace.name}
        onSubmit={() => actions?.delete?.(workspace.id)}
      />,
    );

  return (
    <div className="space-y-[18px]">
      <SettingsSection title={workspaceSettings.title}>
        <Content {...workspaceSettings.name}>
          <Input value={workspace.name} onChange={updateName} />
        </Content>
        <Content {...workspaceSettings.icon}>
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
      <SettingsSection title={publicSettings.title}>
        {/* <Content
          title={publicSettings.domain.title}
          description={
            <TextLink
              i18nKey="general.public-settings.domain.description"
              values={{ site, link }}
            />
          }
        >
          <Input
            className="w-[255px]"
            value={workspace.domain}
            onChange={updateDomain}
          />
        </Content> */}
        {/* <Content
          title={publicSettings.public.title}
          description={
            <TextLink
              i18nKey="general.public-settings.public.description"
              values={{ site }}
            />
          }
        >
          <Input search placeholder="Select a page shared to web" />
        </Content> */}
      </SettingsSection>
      <SettingsSection title={exportSettings.title}>
        <Content
          {...exportSettings.content}
          href="https://www.notion.com/help/workspace-settings"
        >
          <Button size="sm">{exportSettings.content.button}</Button>
        </Content>
        <Content
          {...exportSettings.members}
          plan="business"
          href="https://www.notion.com/help/workspace-settings"
        >
          <Button size="sm" disabled>
            {exportSettings.members.button}
          </Button>
        </Content>
      </SettingsSection>
      <SettingsSection title={analytics.title}>
        <Content
          hint={analytics.analytics.hint}
          href="https://www.notion.com/help/workspace-analytics"
        >
          <SettingsRule
            title={analytics.analytics.title}
            description={
              <TextLinks
                i18nKey="general.analytics.analytics.description"
                values={{ workspace: workspace.name }}
              />
            }
          >
            <Switch size="sm" />
          </SettingsRule>
        </Content>
      </SettingsSection>
      <SettingsSection title={danger.title}>
        <Content
          hint={danger.hint}
          href="https://www.notion.com/help/create-delete-and-switch-workspaces#delete-workspace"
        >
          <Button variant="red" size="sm" onClick={deleteWorkspace}>
            {danger.delete}
          </Button>
        </Content>
      </SettingsSection>
    </div>
  );
}
