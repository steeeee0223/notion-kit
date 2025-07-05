import type { Meta, StoryObj } from "@storybook/react";

import {
  ConnectionsTable,
  GuestsTable,
  MembersTable,
  PlansTable,
  SCOPES,
  SessionsTable,
} from "@notion-kit/settings-panel";

import { mockConnections, mockMemberships, mockSessions } from "./data";

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
    return <MembersTable data={mockMemberships.members} scopes={scopes} />;
  },
};

export const Guests: Story = {
  render: () => {
    const scopes = SCOPES.owner.plus;
    return <GuestsTable data={mockMemberships.guests} scopes={scopes} />;
  },
};

export const Plans: Story = {
  render: () => <PlansTable />,
};
