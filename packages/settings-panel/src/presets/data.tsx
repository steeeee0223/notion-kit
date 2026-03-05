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
];

export const workspaceTabs: TabItem[] = [
  { Icon: <Icon.Gear />, value: "general" },
  { Icon: <Icon.People />, value: "people" },
  { Icon: <Icon.ArrowLineDown />, value: "import" },
];

export const featuresTabs: TabItem[] = [
  { Icon: <Icon.AiFace />, value: "notion-ai" },
  { Icon: <Icon.BrowserClick />, value: "sites" },
  { Icon: <Icon.EmojiFace />, value: "emoji" },
];

export const integrationsTabs: TabItem[] = [
  { Icon: <Icon.SquareGrid2x2 />, value: "connections" },
];

export const adminTabs: TabItem[] = [
  { Icon: <Icon.Teamspace />, value: "teamspaces" },
  { Icon: <Icon.Key />, value: "security" },
  { Icon: <Icon.CheckmarkShield />, value: "identity" },
];

export const billingTabs: TabItem[] = [
  { Icon: <Icon.CreditCard />, value: "billing" },
  { Icon: <Icon.Map />, value: "plans" },
];
