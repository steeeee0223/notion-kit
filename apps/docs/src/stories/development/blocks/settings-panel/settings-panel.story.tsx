import { defineStory } from "@/lib/story";
import { blocksSettingsPanelSettingsPanel } from "@/stories/development.lazy";

export const Default = defineStory({
  Component: blocksSettingsPanelSettingsPanel.DefaultExample,
  displayName: "Default",
  args: { initial: { tab: "account" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Default",
    width: 1280,
    height: 800,
  },
});
export const Notifications = defineStory({
  Component: blocksSettingsPanelSettingsPanel.NotificationsExample,
  displayName: "Notifications",
  args: { initial: { tab: "notifications" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Notifications",
    width: 1280,
    height: 800,
  },
});
export const MyConnections = defineStory({
  Component: blocksSettingsPanelSettingsPanel.MyConnectionsExample,
  displayName: "My Connections",
  args: { initial: { tab: "my-connections" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/MyConnections",
    width: 1280,
    height: 800,
  },
});
export const Workspace = defineStory({
  Component: blocksSettingsPanelSettingsPanel.WorkspaceExample,
  displayName: "Workspace",
  args: { initial: { tab: "general" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Workspace",
    width: 1280,
    height: 800,
  },
});
export const People = defineStory({
  Component: blocksSettingsPanelSettingsPanel.PeopleExample,
  displayName: "People",
  args: { initial: { tab: "people" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/People",
    width: 1280,
    height: 800,
  },
});
export const Emoji = defineStory({
  Component: blocksSettingsPanelSettingsPanel.EmojiExample,
  displayName: "Emoji",
  args: { initial: { tab: "emoji" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Emoji",
    width: 1280,
    height: 800,
  },
});
export const Teamspaces = defineStory({
  Component: blocksSettingsPanelSettingsPanel.TeamspacesExample,
  displayName: "Teamspaces",
  args: { initial: { tab: "teamspaces" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Teamspaces",
    width: 1280,
    height: 800,
  },
});
export const Security = defineStory({
  Component: blocksSettingsPanelSettingsPanel.SecurityExample,
  displayName: "Security",
  args: { initial: { tab: "security" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Security",
    width: 1280,
    height: 800,
  },
});
export const Identity = defineStory({
  Component: blocksSettingsPanelSettingsPanel.IdentityExample,
  displayName: "Identity",
  args: { initial: { tab: "identity" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Identity",
    width: 1280,
    height: 800,
  },
});
export const Billing = defineStory({
  Component: blocksSettingsPanelSettingsPanel.BillingExample,
  displayName: "Billing",
  args: { initial: { tab: "billing" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Billing",
    width: 1280,
    height: 800,
  },
});
export const Plans = defineStory({
  Component: blocksSettingsPanelSettingsPanel.PlansExample,
  displayName: "Plans",
  args: { initial: { tab: "plans" } },
  frame: {
    src: "/story/development/blocks/settings-panel/settings-panel/Plans",
    width: 1280,
    height: 800,
  },
});
