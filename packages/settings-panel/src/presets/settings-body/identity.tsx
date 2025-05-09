/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
"use client";

import { CircleHelp } from "lucide-react";
import { toast } from "sonner";

import { Hint } from "@notion-kit/common";
import { useCopyToClipboard } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import { Switch } from "@notion-kit/shadcn";

import { HintButton } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";

export const Identity = () => {
  const {
    settings: { workspace },
  } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const { domain, user, saml, scim, setup } = t("identity", {
    returnObjects: true,
  });
  /** Handlers */
  const [, copy] = useCopyToClipboard();
  const handleCopy = async () => {
    await copy(workspace.id);
    toast.success("Copied property to clipboard");
  };

  return (
    <div className="space-y-12">
      <SettingsSection title={domain.title}>
        <SettingsRule {...domain.domains} plan="business" />
        <SettingsRule {...domain.creation} plan="enterprise" />
        <SettingsRule {...domain.claim} plan="enterprise" />
      </SettingsSection>
      <SettingsSection title={user.title}>
        <div className="text-sm/4 font-normal text-secondary">
          {user.description}
        </div>
        <HintButton
          icon={CircleHelp}
          label={user.buttons.hint}
          href="https://www.notion.com/help/managed-users-dashboard"
        />
        <SettingsRule {...user.dashboard} plan="enterprise" />
        <SettingsRule {...user.profile} plan="enterprise" />
        <SettingsRule {...user.external} plan="enterprise" />
        <SettingsRule {...user.support} plan="enterprise" />
        <SettingsRule {...user.session} plan="enterprise" />
        <SettingsRule {...user.logout} plan="enterprise" />
        <SettingsRule {...user.password} plan="enterprise" />
        <SettingsRule {...user.mail} plan="enterprise" />
      </SettingsSection>
      <SettingsSection title={saml.title}>
        <HintButton
          icon={CircleHelp}
          label={saml.buttons.hint}
          href="https://www.notion.com/help/saml-sso-configuration"
        />
        <SettingsRule {...saml.saml} plan="business" />
        <SettingsRule {...saml.login} plan="business" />
        <SettingsRule {...saml.creation}>
          <Switch size="sm" disabled />
        </SettingsRule>
        <SettingsRule {...saml.linked} />
      </SettingsSection>
      <SettingsSection title={scim.title}>
        <SettingsRule {...scim.scim} plan="enterprise" />
      </SettingsSection>
      <SettingsSection title={setup.title}>
        <SettingsRule title="" description={setup["workspace-id"].description}>
          <Hint
            description={setup["workspace-id"].tooltip}
            side="top"
            sideOffset={15}
            align="center"
          >
            <div className="min-w-max px-[60px] text-xs/4 text-secondary">
              <a
                onClick={handleCopy}
                rel="noopener noreferrer"
                className="inline cursor-pointer underline select-none hover:text-red-600"
              >
                {workspace.id}
              </a>
            </div>
          </Hint>
        </SettingsRule>
      </SettingsSection>
    </div>
  );
};
