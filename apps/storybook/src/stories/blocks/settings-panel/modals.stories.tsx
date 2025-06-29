import type { Meta, StoryObj } from "@storybook/react";

import { ModalProvider, useModal } from "@notion-kit/modal";
import {
  Add2FAForm,
  AddMembers,
  DeleteAccount,
  DeleteGuest,
  DeleteMember,
  DeleteWorkspace,
  EmailSettings,
  Enable2FAMethod,
  PasskeysModal,
  PasswordForm,
} from "@notion-kit/settings-panel";
import { Button, type ButtonProps } from "@notion-kit/shadcn";

import { mockMemberships, mockUser, mockWorkspaces } from "./data";

const ModalTrigger = ({
  text,
  variant,
  children,
}: Pick<ButtonProps, "children" | "variant"> & { text: string }) => {
  const { openModal } = useModal();
  const onClick = () => openModal(children);
  return (
    <Button variant={variant} size="sm" onClick={onClick}>
      {text}
    </Button>
  );
};

const meta = {
  title: "blocks/Settings Panel/Modals",
  component: ModalTrigger,
  parameters: { layout: "centered" },
  render: (props) => (
    <ModalProvider>
      <ModalTrigger {...props} />
    </ModalProvider>
  ),
} satisfies Meta<typeof ModalTrigger>;
export default meta;

type Story = StoryObj<typeof meta>;

const { members, guests } = mockMemberships;
export const AddMembersModal: Story = {
  args: {
    children: (
      <AddMembers
        invitedMembers={[
          ...members.map(({ user }) => user),
          ...guests.map(({ user }) => user),
        ]}
        onAdd={(emails, role) => console.log(`Adding ${role}s: `, emails)}
      />
    ),
    text: "Add Members",
    variant: "blue",
  },
};
export const DeleteAccountModal: Story = {
  args: {
    children: <DeleteAccount email={mockUser.email} />,
    text: "Delete Account",
    variant: "red-fill",
  },
};
export const DeleteGuestModal: Story = {
  args: {
    children: <DeleteGuest name={mockUser.name} />,
    text: "Delete Guest",
    variant: "red-fill",
  },
};
export const DeleteMemberModal: Story = {
  args: {
    children: <DeleteMember />,
    text: "Delete Member",
    variant: "red-fill",
  },
};
export const DeleteWorkspaceModal: Story = {
  args: {
    children: <DeleteWorkspace name={mockWorkspaces[0]!.name} />,
    text: "Delete Workspace",
    variant: "red-fill",
  },
};
export const EmailSettingsModal: Story = {
  args: {
    children: <EmailSettings email={mockUser.email} />,
    text: "Update Email",
  },
};
export const SetPasswordModal: Story = {
  args: {
    children: <PasswordForm hasPassword={false} />,
    text: "Set Password",
  },
};
export const ChangePasswordModal: Story = {
  args: {
    children: <PasswordForm hasPassword />,
    text: "Change Password",
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
    text: "Add verification method",
  },
};

export const Enable2FAMethodModal: Story = {
  args: {
    children: <Enable2FAMethod />,
    text: "Enable 2FA Method",
  },
};

export const PasskeysManagement: Story = {
  args: {
    children: (
      <PasskeysModal
        passkeys={[
          { id: "p-1", name: "My Laptop", createdAt: Date.UTC(2023, 10, 1) },
          { id: "p-2", name: "My Phone", createdAt: Date.UTC(2023, 10, 2) },
          { id: "p-3", name: "My Tablet", createdAt: Date.UTC(2023, 10, 3) },
        ]}
        onRename={(data) => console.log("Renaming passkey", data.name)}
      />
    ),
    text: "Add Passkeys",
  },
};
