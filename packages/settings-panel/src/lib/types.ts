import type { LOCALE } from "@notion-kit/i18n";
import type { IconData, User } from "@notion-kit/schemas";
import { Plan, Role } from "@notion-kit/schemas";

export enum Scope {
  /** Workspace settings */
  WorkspaceUpdate = "workspace:update",
  /** People */
  MemberInvite = "people:invite",
  MemberRead = "people:read",
  MemberAdd = "people:add",
  MemberAddRequest = "people:add:request",
  MemberUpdate = "people:update",
  GroupEnable = "people:group:enable",
  /** Teamspaces */
  TeamspaceRead = "teamspace:read",
  TeamspaceCreate = "teamspace:create",
  /** Plans */
  Upgrade = "plan:upgrade",
}

export type PartialRole = Role.OWNER | Role.MEMBER;

export interface Passkey {
  id: string;
  name: string;
  createdAt: number; // ts in ms
}

export interface WorkspaceStore {
  id: string;
  name: string;
  icon: IconData;
  slug: string;
  /** People */
  inviteLink: string;
  /** Plans */
  plan: Plan;
  /** Current account */
  role: Role;
}

export interface AccountStore extends User {
  /** My Account */
  preferredName: string;
  hasPassword?: boolean;
  currentSessionId?: string;
  /** Region */
  language?: LOCALE;
  timezone?: string;
}

export type ConnectionStrategy =
  | "slack"
  | "google-drive"
  | "figma"
  | "github"
  | "gitlab"
  | "grid"
  | "jira";

export type TeamspacePermission = "default" | "open" | "closed" | "private";
export type TeamspaceRole = "owner" | "member";

/** Table Data */
export interface SessionRow {
  id: string;
  token: string;
  device: string;
  type: "laptop" | "mobile" | "unknown";
  lastActive: number; // ts in ms
  location: string;
}

export interface Connection {
  id: string;
  connection: { type: string; account: string; accountId?: string };
  scopes: string[];
}

export interface CellOptions<T extends { id: string }> {
  current: string | null;
  options: T[];
}

export interface MemberTeamspace {
  id: string;
  name: string;
  icon: IconData;
  memberCount: number;
}

export interface MemberRow {
  id: string; // the member ID
  user: User;
  teamspaces: MemberTeamspace[];
  groups: CellOptions<GroupOption>;
  role: Role;
}

export interface PageAccess {
  id: string;
  name: string;
  scope: string;
}

export interface GuestRow {
  id: string; // the member ID
  user: User;
  access: PageAccess[];
}

export interface InvitationRow {
  id: string; // the invitation ID
  email: string;
  role: Role;
  invitedBy: User;
  status: "pending" | "rejected" | "canceled";
}
export type Invitations = Record<string, InvitationRow>;

export interface GroupOption {
  id: string;
  name: string;
  memberCount: number;
}

/**
 * @note key: user ID
 */
export type Memberships = Record<
  string,
  {
    id: string; // the member ID
    role: Role;
    user: User;
  }
>;

export interface SettingsStore {
  workspace: WorkspaceStore;
  account: AccountStore;
}
export interface WorkspaceMemberships {
  members: MemberRow[];
  guests: GuestRow[];
}

export interface TeamMemberRow {
  id: string; // the user id
  user: User;
  isWorkspaceOwner?: boolean;
  role: TeamspaceRole;
}
export interface TeamspaceRow {
  id: string;
  name: string;
  icon: IconData;
  description?: string;
  memberCount: number;
  permission: TeamspacePermission;
  ownedBy: {
    name: string;
    avatarUrl?: string;
  };
  ownerCount: number;
  updatedAt: number; // ts in ms
  /**
   * @prop the role of the user in the teamspace
   */
  role?: TeamspaceRole | false;
}

export type Teamspaces = Record<
  string,
  {
    id: string;
    name: string;
    icon: IconData;
    description?: string;
    permission: TeamspacePermission;
    members: { userId: string; role: TeamspaceRole }[];
    updatedAt: number; // ts in ms
    ownedBy: string;
  }
>;
