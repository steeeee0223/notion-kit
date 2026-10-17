import {
  mockEmojis,
  mockTeamMemberRows,
} from "@notion-kit/registry/settings-panel-notion";
import { EmojisTable, TeamMembersTable } from "@notion-kit/settings-panel";

export function TeamMembersExample() {
  return <TeamMembersTable data={mockTeamMemberRows} />;
}

export function EmojisExample() {
  return <EmojisTable data={mockEmojis} />;
}
