import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { delay } from "msw";

import { CreateTeamspace, TeamspaceDetail } from "@notion-kit/settings-panel";
import { Dialog } from "@notion-kit/shadcn";

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
        teamMembers={[]}
      />
    ),
  },
};
