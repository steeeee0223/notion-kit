import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { delay } from "msw";

import {
  Add2FAForm,
  AddMembers,
  AddTeamMembers,
  CreateTeamspace,
  DeleteAccount,
  DeleteGuest,
  DeleteMember,
  DeleteWorkspace,
  EmailSettings,
  Enable2FAMethod,
  PasskeysModal,
  PasswordForm,
  SettingsProvider,
  TeamspaceDetail,
  Upgrade,
} from "@notion-kit/settings-panel";
import { Dialog } from "@notion-kit/shadcn";

import { env } from "@/env";

import {
  mockGuests,
  mockMembers,
  mockPasskeys,
  mockSettings,
  mockTeamMemberRows,
  mockUser,
  mockUsers,
  mockWorkspaces,
} from "./data";

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

// Migrated stories from modals.stories.tsx
export const AddMembersModal: Story = {
  render: () => (
    <AddMembers
      open
      invitedMembers={[
        ...mockMembers.map(({ user }) => user),
        ...mockGuests.map(({ user }) => user),
      ]}
      onAdd={({ emails, role }) => console.log(`Adding ${role}s: `, emails)}
    />
  ),
};

export const DeleteAccountModal: Story = {
  args: {
    children: <DeleteAccount email={mockUser.email} />,
  },
};

export const DeleteGuestModal: Story = {
  args: {
    children: <DeleteGuest name={mockUser.name} />,
  },
};

export const DeleteMemberModal: Story = {
  args: {
    children: <DeleteMember />,
  },
};

export const DeleteWorkspaceModal: Story = {
  args: {
    children: <DeleteWorkspace name={mockWorkspaces[0]!.name} />,
  },
};

export const EmailSettingsModal: Story = {
  args: {
    children: <EmailSettings email={mockUser.email} />,
  },
};

export const SetPasswordModal: Story = {
  args: {
    children: <PasswordForm hasPassword={false} />,
  },
};

export const ChangePasswordModal: Story = {
  args: {
    children: <PasswordForm hasPassword />,
  },
};

export const Add2FAModal: Story = {
  args: {
    children: (
      <Add2FAForm
        preferredName="john"
        email="john@example.com"
        avatarUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Go_gopher_favicon.svg/1200px-Go_gopher_favicon.svg.png"
        onSubmit={() => true}
      />
    ),
  },
};

export const Enable2FAMethodModal: Story = {
  args: {
    children: <Enable2FAMethod />,
  },
};

export const PasskeysManagement: Story = {
  args: {
    children: <PasskeysModal />,
  },
  render: (props) => (
    <SettingsProvider
      settings={mockSettings}
      passkeys={{ getAll: () => Promise.resolve(mockPasskeys) }}
    >
      <Portal {...props} />
    </SettingsProvider>
  ),
};

const stripePromise = loadStripe(env.STORYBOOK_STRIPE_PUBLISHABLE_KEY);

export const UpgradeModal: Story = {
  render: () => (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "setup",
        currency: "usd",
      }}
    >
      <Portal>
        <Upgrade
          plan={{ name: "Plus", monthly: 12, annual: 10 }}
          description="Do more with unlimited charts, files, automations & integrations"
          defaultName="Steve Yu"
        />
      </Portal>
    </Elements>
  ),
};
