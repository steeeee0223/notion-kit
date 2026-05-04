import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import {
  mockEmojis,
  mockGuests,
  mockMembers,
  mockPasskeys,
  mockTeamMemberRows,
  mockUser,
  mockUsers,
  mockWorkspaces,
} from "@notion-kit/registry/settings-panel-notion";
import {
  Add2FAForm,
  AddMembers,
  AddTeamMembers,
  ChangePaymentMethod,
  createMockPasskeysAdapter,
  CreateTeamspace,
  DeleteAccount,
  DeleteGuest,
  DeleteMember,
  DeleteWorkspace,
  EmailSettings,
  EmojiForm,
  Enable2FAMethod,
  PasskeysModal,
  PasswordForm,
  SettingsProvider,
  TeamspaceDetail,
  Upgrade,
} from "@notion-kit/settings-panel";
import { Dialog } from "@notion-kit/ui/primitives";

import { env } from "@/env";
import { asyncSuccess } from "@/lib/utils";

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
      <CreateTeamspace
        workspace="Acme Inc."
        onSubmit={() => asyncSuccess("Teamspace created")}
      />
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
        onAddMembers={() => asyncSuccess("Members added")}
      />
    ),
  },
};

export const AddMembersModal: Story = {
  render: () => (
    <AddMembers
      open
      invitedMembers={[
        ...mockMembers.map(({ user }) => user),
        ...mockGuests.map(({ user }) => user),
      ]}
      onAdd={({ role }) => asyncSuccess(`${role}s invited`)}
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
      adapters={{
        passkeys: createMockPasskeysAdapter(mockPasskeys),
      }}
    >
      <Portal {...props} />
    </SettingsProvider>
  ),
};

const stripePromise = loadStripe(env.STORYBOOK_STRIPE_PUBLISHABLE_KEY, {});

export const UpgradeModal: Story = {
  render: (props) => {
    return (
      <Portal {...props}>
        <Upgrade
          plan={{ name: "Plus", monthly: 12, annual: 10 }}
          description="Do more with unlimited charts, files, automations & integrations"
          defaultName="Steve Yu"
          stripePromise={stripePromise}
        />
      </Portal>
    );
  },
};

export const ChangePaymentMethodModal: Story = {
  render: () => {
    return (
      <Portal>
        <ChangePaymentMethod
          stripePromise={stripePromise}
          onConfirm={() => asyncSuccess("Payment method updated")}
        />
      </Portal>
    );
  },
};

export const AddEmojiModal: Story = {
  args: {
    children: (
      <EmojiForm onSave={(data) => asyncSuccess(`Added ${data.name}`)} />
    ),
  },
};

export const EditEmojiModal: Story = {
  args: {
    children: (
      <EmojiForm
        emoji={mockEmojis[0]}
        onSave={(data) => asyncSuccess(`Modified ${data.name}`)}
      />
    ),
  },
};
