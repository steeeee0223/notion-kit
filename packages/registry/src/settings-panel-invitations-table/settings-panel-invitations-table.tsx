import { Role } from "@notion-kit/schemas";
import {
  InvitationsTable,
  Scope,
  type InvitationRow,
} from "@notion-kit/settings-panel";

const scopes = new Set(Object.values(Scope));
const mockUser = {
  id: "user1",
  name: "Shad CN",
  avatarUrl: "https://github.com/shadcn.png",
  email: "shadcn@example.com",
};
export const mockInvitations: InvitationRow[] = [
  {
    id: "i-1",
    role: Role.MEMBER,
    email: "invitee1@example.com",
    status: "pending",
    invitedBy: mockUser,
  },
  {
    id: "i-2",
    role: Role.OWNER,
    email: "invitee2@example.com",
    status: "canceled",
    invitedBy: mockUser,
  },
  {
    id: "i-3",
    role: Role.GUEST,
    email: "invitee3@example.com",
    status: "rejected",
    invitedBy: mockUser,
  },
];

export default function Demo() {
  return <InvitationsTable data={mockInvitations} scopes={scopes} />;
}
