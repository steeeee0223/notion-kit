import { defineStory } from "@/lib/story";

import { EmojisExample, TeamMembersExample } from "./tables.lazy";

export const TeamMembers = defineStory({
  Component: TeamMembersExample,
  displayName: "Team Members",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/settings-panel/tables/TeamMembers",
    width: 1280,
    height: 800,
  },
});
export const Emojis = defineStory({
  Component: EmojisExample,
  displayName: "Emojis",
  args: { initial: {} },
  frame: {
    src: "/story/development/blocks/settings-panel/tables/Emojis",
    width: 1280,
    height: 800,
  },
});
