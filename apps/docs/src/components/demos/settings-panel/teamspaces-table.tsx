import { TeamspacesTable, type TeamspaceRow } from "@notion-kit/settings-panel";

export const mockTeamspaces: TeamspaceRow[] = [
  {
    id: "team-1",
    name: "Acme Lab 1",
    icon: { type: "text", src: "A" },
    memberCount: 20,
    permission: "default",
    ownedBy: { name: "Jason" },
    ownerCount: 3,
    updatedAt: Date.UTC(2024, 5, 1),
  },
  {
    id: "team-2",
    name: "Acme Lab 2",
    icon: { type: "text", src: "B" },
    memberCount: 30,
    permission: "default",
    ownedBy: { name: "Alice" },
    ownerCount: 2,
    updatedAt: Date.UTC(2024, 5, 3),
  },
  {
    id: "team-3",
    name: "Acme Lab 3",
    icon: { type: "text", src: "C" },
    memberCount: 25,
    permission: "default",
    ownedBy: { name: "Bob" },
    ownerCount: 1,
    updatedAt: Date.UTC(2024, 5, 10),
  },
];

export default function Demo() {
  return <TeamspacesTable workspace="Acme Inc." data={mockTeamspaces} />;
}
