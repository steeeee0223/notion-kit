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

export type PartialRole = Exclude<Role, Role.GUEST>;

export interface Passkey {
  id: string;
  name: string;
  createdAt: number; // ts in seconds
}

export interface WorkspaceStore {
  id: string;
  name: string;
  icon: IconData;
  domain: string;
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
  passkeys?: Passkey[];
  currentSessionId?: string;
  sessions: SessionRow[];
  /** Region */
  language?: LOCALE;
}

export type ConnectionStrategy =
  | "slack"
  | "google-drive"
  | "figma"
  | "github"
  | "gitlab"
  | "grid"
  | "jira";

/** Table Data */
export interface SessionRow {
  id: string;
  token: string;
  device: string;
  type: "laptop" | "mobile" | "unknown";
  lastActive: number; // ts in seconds
  location: string;
}

export interface Connection {
  id: string;
  connection: { type: string; account: string };
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

export interface GroupOption {
  id: string;
  name: string;
  memberCount: number;
}

type Membership =
  | ({ role: Role.OWNER | Role.MEMBER } & MemberRow)
  | ({ role: Role.GUEST } & GuestRow);

export interface SettingsStore {
  workspace: WorkspaceStore;
  account: AccountStore;
  /**
   * key: userId
   */
  memberships: Record<string, Membership>;
}

export interface UpdateSettingsParams {
  workspace?: Partial<WorkspaceStore>;
  account?: Partial<AccountStore>;
  memberships?: Record<string, Membership>;
}
export type UpdateSettings = (data: UpdateSettingsParams) => Promise<void>;

export interface WorkspaceMemberships {
  members: MemberRow[];
  guests: GuestRow[];
}
