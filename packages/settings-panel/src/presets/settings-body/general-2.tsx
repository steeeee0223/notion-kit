"use client";

import React from "react";

import { BaseModal } from "@notion-kit/common";
import { useTranslation } from "@notion-kit/i18n";
import { useModal } from "@notion-kit/modal";
import { Button } from "@notion-kit/shadcn";

import { Content } from "../_components";
import { SettingsSection, useSettings } from "../../core";

export const General2 = () => {
  const {
    settings: { account },
    people,
  } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const { danger, modals } = t("general", {
    returnObjects: true,
  });
  /** Handlers */
  const { openModal } = useModal();
  const onLeaveWorkspace = () =>
    openModal(
      <BaseModal
        {...modals.leave}
        onTrigger={() => people?.delete?.(account.id)}
      />,
    );

  return (
    <SettingsSection title={danger.title}>
      <Content>
        <Button variant="red" size="sm" onClick={onLeaveWorkspace}>
          {danger.leave}
        </Button>
      </Content>
    </SettingsSection>
  );
};
