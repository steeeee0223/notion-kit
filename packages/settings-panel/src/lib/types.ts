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

export interface MemberRow {
  user: User;
  teamspaces: CellOptions<GroupOption>;
  groups: CellOptions<GroupOption>;
  role: Role;
}

export interface PageAccess {
  id: string;
  name: string;
  scope: string;
}

export interface GuestRow {
  user: User;
  access: PageAccess[];
}

export interface InvitationRow {
  /**
   * @prop the unique identifier for the invitation
   */
  id: string;
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

export type Memberships = Record<string, { role: Role; user: User }>;

export interface SettingsStore {
  workspace: WorkspaceStore;
  account: AccountStore;
}
export interface WorkspaceMemberships {
  members: MemberRow[];
  guests: GuestRow[];
}

export interface TeamMemberRow {
  id: string; // the member id
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
  owners: {
    ownerName: string;
    ownerAvatarUrl?: string;
    count: number;
  };
  members: TeamMemberRow[];
  updatedAt: number; // ts in ms
}

export type Teamspaces = Record<string, TeamspaceRow>;
