import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  ConnectionsTable,
  GuestsTable,
  InvitationsTable,
  MembersTable,
  PlansTable,
  SCOPES,
  SessionsTable,
  TeamspacesTable,
} from "@notion-kit/settings-panel";

import {
  mockConnections,
  mockGuests,
  mockInvitations,
  mockMembers,
  mockSessions,
  mockTeamspaces,
} from "./data";

const meta = {
  title: "blocks/Settings Panel/Tables",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Sessions: Story = {
  render: () => (
    <SessionsTable currentSessionId={mockSessions[0]!.id} data={mockSessions} />
  ),
};

export const MyConnections: Story = {
  render: () => <ConnectionsTable data={mockConnections} />,
};

export const Members: Story = {
  render: () => {
    const scopes = SCOPES.owner.plus;
    return <MembersTable data={mockMembers} scopes={scopes} />;
  },
};

export const Guests: Story = {
  render: () => {
    const scopes = SCOPES.owner.plus;
    return <GuestsTable data={mockGuests} scopes={scopes} />;
  },
};

export const Invitations: Story = {
  render: () => {
    const scopes = SCOPES.owner.plus;
    return <InvitationsTable data={mockInvitations} scopes={scopes} />;
  },
};

export const Teamspaces: Story = {
  render: () => <TeamspacesTable workspace="Acme Inc." data={mockTeamspaces} />,
};

export const Plans: Story = {
  render: () => <PlansTable />,
};
