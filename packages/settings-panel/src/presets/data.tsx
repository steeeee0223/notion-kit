import React from "react";

import { Icon } from "@notion-kit/icons";

import type { ConnectionCardProps } from "./_components";

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

export const connectionCardData: ConnectionCardProps[] = [
  {
    id: "slack",
    title: "Slack",
    description:
      "Notifications, live links, and workflows between Notion and Slack",
    imageUrl:
      "https://www.notion.so/images/external_integrations/slack-icon.png",
    tags: ["link preview"],
  },
  {
    id: "google-drive",
    title: "Google Drive",
    description: "Add previews of files.",
    imageUrl:
      "https://s3-us-west-2.amazonaws.com/public.notion-static.com/8fb58690-ee50-4584-b9fd-ca9b524f56aa/google-drive-icon-19632.png",
    tags: ["link preview"],
  },
  {
    id: "figma",
    title: "Figma",
    description: "View Figma designs directly in Notion",
    imageUrl:
      "https://www.notion.so/images/external_integrations/figma-icon.png",
    tags: ["link preview"],
  },
  {
    id: "github",
    title: "Github (Workspace)",
    description:
      "Enable everyone in your workspace to link PRs in databases and automate workflows",
    imageUrl:
      "https://www.notion.so/images/external_integrations/github-icon.png",
    tags: ["link preview"],
  },
  {
    id: "gitlab",
    title: "Gitlab",
    description:
      "View the latest updates from GitLab in Notion pages and databases",
    imageUrl:
      "https://s3-us-west-2.amazonaws.com/public.notion-static.com/50cf5244-07dc-4b4e-a028-963a89e8e6a5/gitlab-logo-500.png",
    tags: ["link preview", "sync"],
  },
  {
    id: "grid",
    title: "GRID",
    description:
      "Embed dynamic dashboards, interactive charts, data visualizations, and calculators in Notion.",
    imageUrl:
      "https://s3-us-west-2.amazonaws.com/public.notion-static.com/794b5f00-bc7a-4415-832a-560d8a930ce9/grid_logo-512.png",
    tags: ["link preview"],
  },
  {
    id: "jira",
    title: "Jira",
    description:
      "View the latest updates from Jira in Notion pages and databases",
    imageUrl:
      "https://www.notion.so/images/external_integrations/jira-icon.png",
    tags: ["link preview", "sync"],
  },
];
