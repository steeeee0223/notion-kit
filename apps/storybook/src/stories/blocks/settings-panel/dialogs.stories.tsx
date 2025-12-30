import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { delay } from "msw";

import {
  Add2FAForm,
  AddTeamMembers,
  CreateTeamspace,
  Enable2FAMethod,
  TeamspaceDetail,
} from "@notion-kit/settings-panel";
import { Dialog } from "@notion-kit/shadcn";

import { mockTeamMemberRows, mockUsers } from "./data";

const Portal = ({ children }: React.PropsWithChildren) => (
  <Dialog open>{children}</Dialog>
);

const meta = {
  title: "blocks/Settings Panel/Dialogs",
  component: Portal,
  parameters: { layout: "centered" },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof Portal>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Enable2FAModal: Story = {
  args: {
    children: <Enable2FAMethod />,
  },
};

export const Add2FAModal: Story = {
  args: {
    children: (
      <Add2FAForm
        preferredName="Acme User"
        email="acme@example.com"
        avatarUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Go_gopher_favicon.svg/1200px-Go_gopher_favicon.svg.png"
        onSubmit={async () => {
          await delay(1000);
          console.log("submit: ******");
        }}
      />
    ),
  },
};

export const CreateTeamspaceModal: Story = {
  args: {
    children: (
      <CreateTeamspace workspace="Acme Inc." onSubmit={() => delay(2000)} />
    ),
  },
};

export const TeamspaceDetailModal: Story = {
  args: {
    children: (
      <TeamspaceDetail
        workspace="Acme Inc."
        teamspace={{
          name: "Acme Lab",
          icon: { type: "text", src: "T" },
          description: "This is an example teamspace.",
          permission: "default",
        }}
        teamMembers={mockTeamMemberRows}
      />
    ),
  },
};

export const AddTeamMembersModal: Story = {
  args: {
    children: (
      <AddTeamMembers
        teamspace={{
          name: "Acme Lab",
          icon: { type: "text", src: "A" },
        }}
        workspaceMembers={mockUsers.map((user, i) => ({
          ...user,
          invited: i % 2 === 0,
        }))}
        onAddMembers={async (data) => {
          await delay(500);
          console.log("submitted with", data);
        }}
      />
    ),
  },
};
