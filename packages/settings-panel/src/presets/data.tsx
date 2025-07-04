import React from "react";

import { Icon } from "@notion-kit/icons";

export type TabType =
  | "account"
  | "preferences"
  | "notifications"
  | "my-connections"
  | "general"
  | "people"
  | "teamspaces"
  | "security"
  | "identity"
  | "notion-ai"
  | "sites"
  | "emoji"
  | "connections"
  | "import"
  | "billing"
  | "plans";

interface TabItem {
  value: Exclude<TabType, "account">;
  Icon: React.ReactNode;
}

export const accountTabs: TabItem[] = [
  { Icon: <Icon.Sliders />, value: "preferences" },
  { Icon: <Icon.Bell />, value: "notifications" },
  { Icon: <Icon.ArrowUpRightSquare />, value: "my-connections" },
] as const;

export const workspaceTabs: TabItem[] = [
  { Icon: <Icon.Gear />, value: "general" },
  { Icon: <Icon.People />, value: "people" },
  { Icon: <Icon.Teamspace />, value: "teamspaces" },
  { Icon: <Icon.Key />, value: "security" },
  { Icon: <Icon.CheckmarkShield />, value: "identity" },
] as const;

export const miscTabs: TabItem[] = [
  { Icon: <Icon.AiFace />, value: "notion-ai" },
  { Icon: <Icon.BrowserClick />, value: "sites" },
  { Icon: <Icon.EmojiFace />, value: "emoji" },
  { Icon: <Icon.SquareGrid2x2 />, value: "connections" },
  { Icon: <Icon.ArrowLineDown />, value: "import" },
];

export const plansTabs: TabItem[] = [
  { Icon: <Icon.CreditCard />, value: "billing" },
  { Icon: <Icon.Map />, value: "plans" },
];
