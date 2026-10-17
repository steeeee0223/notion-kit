import React from "react";
import type { ComponentProps } from "react";
import { loadStripe } from "@stripe/stripe-js";

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

const stripePromise = env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(env.VITE_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

export function CreateTeamspaceModalExample() {
  const args = {
    children: (
      <CreateTeamspace
        workspace="Acme Inc."
        onSubmit={() => asyncSuccess("Teamspace created")}
      />
    ),
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function TeamspaceDetailModalExample() {
  const args = {
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
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function AddTeamMembersModalExample() {
  const args = {
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
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function AddMembersModalExample() {
  return (
    <AddMembers
      open
      invitedMembers={[
        ...mockMembers.map(({ user }) => user),
        ...mockGuests.map(({ user }) => user),
      ]}
      onAdd={({ role }) => asyncSuccess(`${role}s invited`)}
    />
  );
}

export function DeleteAccountModalExample() {
  const args = {
    children: <DeleteAccount email={mockUser.email} />,
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function DeleteGuestModalExample() {
  const args = {
    children: <DeleteGuest name={mockUser.name} />,
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function DeleteMemberModalExample() {
  const args = { children: <DeleteMember /> } satisfies Partial<
    ComponentProps<typeof Portal>
  >;
  return <Portal {...args} />;
}

export function DeleteWorkspaceModalExample() {
  const args = {
    children: <DeleteWorkspace name={mockWorkspaces[0]!.name} />,
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function EmailSettingsModalExample() {
  const args = {
    children: <EmailSettings email={mockUser.email} />,
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function SetPasswordModalExample() {
  const args = {
    children: <PasswordForm hasPassword={false} />,
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function ChangePasswordModalExample() {
  const args = { children: <PasswordForm hasPassword /> } satisfies Partial<
    ComponentProps<typeof Portal>
  >;
  return <Portal {...args} />;
}

export function Add2FAModalExample() {
  const args = {
    children: (
      <Add2FAForm
        preferredName="john"
        email="john@example.com"
        avatarUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Go_gopher_favicon.svg/1200px-Go_gopher_favicon.svg.png"
        onSubmit={() => true}
      />
    ),
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function Enable2FAMethodModalExample() {
  const args = { children: <Enable2FAMethod /> } satisfies Partial<
    ComponentProps<typeof Portal>
  >;
  return <Portal {...args} />;
}

export function PasskeysManagementExample() {
  const props = { children: <PasskeysModal /> } satisfies Partial<
    ComponentProps<typeof Portal>
  >;
  return (
    <SettingsProvider
      adapters={{
        passkeys: createMockPasskeysAdapter(mockPasskeys),
      }}
    >
      <Portal {...props} />
    </SettingsProvider>
  );
}

export function UpgradeModalExample() {
  const props = {} satisfies Partial<ComponentProps<typeof Portal>>;

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
}

export function ChangePaymentMethodModalExample() {
  return (
    <Portal>
      <ChangePaymentMethod
        stripePromise={stripePromise}
        onConfirm={() => asyncSuccess("Payment method updated")}
      />
    </Portal>
  );
}

export function AddEmojiModalExample() {
  const args = {
    children: (
      <EmojiForm onSave={(data) => asyncSuccess(`Added ${data.name}`)} />
    ),
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}

export function EditEmojiModalExample() {
  const args = {
    children: (
      <EmojiForm
        emoji={mockEmojis[0]}
        onSave={(data) => asyncSuccess(`Modified ${data.name}`)}
      />
    ),
  } satisfies Partial<ComponentProps<typeof Portal>>;
  return <Portal {...args} />;
}
