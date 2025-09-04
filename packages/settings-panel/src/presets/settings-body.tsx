"use client";

import React from "react";

import { useTranslation } from "@notion-kit/i18n";

import { SettingsSection } from "../core";
import { NotImplemented } from "./_components";
import { Account } from "./account";
import { Connections } from "./connections";
import type { TabType } from "./data";
import { General } from "./general";
import { Identity } from "./identity";
import { Notifications } from "./notifications";
import { NotionAI } from "./notion-ai";
import { People } from "./people";
import { Plans } from "./plans";
import { Preferences } from "./preferences";
import { Security } from "./security";
import { Teamspaces } from "./teamspaces";

interface SettingsBodyProps {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const SettingsBody: React.FC<SettingsBodyProps> = ({
  tab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  switch (tab) {
    case "account":
      return <Account />;
    case "preferences":
      return <Preferences />;
    case "notifications":
      return <Notifications />;
    case "my-connections":
      return <Connections />;
    case "general":
      return <General />;
    case "people":
      return <People />;
    case "teamspaces":
      return <Teamspaces />;
    case "security":
      return <Security onTabChange={onTabChange} />;
    case "identity":
      return <Identity />;
    case "notion-ai":
      return <NotionAI />;
    case "plans":
      return <Plans />;
    default:
      return (
        <SettingsSection title={t(`${tab}.title`)}>
          <NotImplemented />
        </SettingsSection>
      );
  }
};
