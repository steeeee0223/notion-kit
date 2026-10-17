import { defineStory } from "@/lib/story";
import { blocksSettingsPanelTables } from "@/stories/development.lazy";

export const TeamMembers = defineStory({
  Component: blocksSettingsPanelTables.TeamMembersExample,
  displayName: "Team Members",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/settings-panel/tables/TeamMembers",
    width: 1280,
    height: 800,
  },
});
export const Emojis = defineStory({
  Component: blocksSettingsPanelTables.EmojisExample,
  displayName: "Emojis",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/settings-panel/tables/Emojis",
    width: 1280,
    height: 800,
  },
});
