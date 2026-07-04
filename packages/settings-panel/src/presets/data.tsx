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
  icon: React.ReactNode;
}

export const accountTabs: TabItem[] = [
  { icon: <Icon.Sliders />, value: "preferences" },
  { icon: <Icon.Bell />, value: "notifications" },
  { icon: <Icon.ArrowUpRightSquare />, value: "my-connections" },
];

export const workspaceTabs: TabItem[] = [
  { icon: <Icon.Gear />, value: "general" },
  { icon: <Icon.People />, value: "people" },
  { icon: <Icon.ArrowLineDown />, value: "import" },
];

export const featuresTabs: TabItem[] = [
  { icon: <Icon.AiFace />, value: "notion-ai" },
  { icon: <Icon.BrowserClick />, value: "sites" },
  { icon: <Icon.EmojiFace />, value: "emoji" },
];

export const integrationsTabs: TabItem[] = [
  { icon: <Icon.SquareGrid2x2 />, value: "connections" },
];

export const adminTabs: TabItem[] = [
  { icon: <Icon.Teamspace />, value: "teamspaces" },
  { icon: <Icon.Key />, value: "security" },
  { icon: <Icon.CheckmarkShield />, value: "identity" },
];

export const billingTabs: TabItem[] = [
  { icon: <Icon.CreditCard />, value: "billing" },
  { icon: <Icon.Map />, value: "plans" },
];
