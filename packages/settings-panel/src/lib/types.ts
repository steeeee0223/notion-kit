import { z } from "zod/v4";

import type { LOCALE } from "@notion-kit/i18n";
import type { IconData, User } from "@notion-kit/schemas";
import { Plan, Role } from "@notion-kit/schemas";

export interface BillingAddress {
  name: string;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

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

export interface BillingStore {
  paymentMethod?: string;
  billedTo?: string;
  billingEmail?: string;
  invoiceEmails?: boolean;
  vatNumber?: string;
  upcomingInvoice?: string;
}

export interface AccountAdapter {
  getAll: () => Promise<AccountStore>;
  update: (data: Partial<Omit<AccountStore, "id">>) => Promise<void>;
  delete: (data: { accountId: string; email: string }) => Promise<void>;
  sendEmailVerification: (email: string) => Promise<void>;
  changePassword: (data: {
    newPassword: string;
    currentPassword: string;
  }) => Promise<void>;
  setPassword?: (newPassword: string) => Promise<void>;
}

export interface SessionsAdapter {
  getAll: () => Promise<SessionRow[]>;
  delete: (token: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}

export interface PasskeysAdapter {
  getAll: () => Promise<Passkey[]>;
  add: () => Promise<boolean>;
  update: (data: { id: string; name: string }) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export interface ConnectionsAdapter {
  getAll: () => Promise<Connection[]>;
  add: (strategy: ConnectionStrategy) => Promise<void>;
  delete: (connection: Connection) => Promise<void>;
}

export interface WorkspaceAdapter {
  getAll: () => Promise<WorkspaceStore>;
  update: (data: Partial<Omit<WorkspaceStore, "id">>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  leave: (id: string) => Promise<void>;
  resetLink: () => Promise<void>;
}

export interface PeopleAdapter {
  getAll: () => Promise<Memberships>;
  update: (data: { id: string; memberId: string; role: Role }) => Promise<void>;
  delete: (data: { id: string; memberId: string }) => Promise<void>;
}

export interface InvitationsAdapter {
  getAll: () => Promise<Invitations>;
  add: (data: { emails: string[]; role: Role }) => Promise<void>;
  cancel: (invitationId: string) => Promise<void>;
}

export interface TeamspacesAdapter {
  getAll: () => Promise<Teamspaces>;
  add: (data: {
    name: string;
    icon: IconData;
    description?: string;
    permission: TeamspacePermission;
  }) => Promise<void>;
  update: (data: {
    id: string;
    name?: string;
    icon?: IconData;
    description?: string;
    permission?: TeamspacePermission;
  }) => Promise<void>;
  delete: (teamspaceId: string) => Promise<void>;
  leave: (teamspaceId: string) => Promise<void>;
  addMembers: (data: {
    teamspaceId: string;
    userIds: string[];
    role: TeamspaceRole;
  }) => Promise<void>;
  updateMember: (data: {
    teamspaceId: string;
    userId: string;
    role: TeamspaceRole;
  }) => Promise<void>;
  deleteMember: (data: {
    teamspaceId: string;
    userId: string;
  }) => Promise<void>;
}

export interface EmojiRow {
  id: string;
  name: string;
  src: string;
  createdBy: string;
  createdAt: number;
}

export type Emojis = Record<string, EmojiRow>;

export interface EmojiAdapter {
  getAll: () => Promise<Emojis>;
  add: (data: { name: string; file: File }) => Promise<void>;
  update: (data: { id: string; name?: string; file?: File }) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export interface BillingAdapter {
  stripePublishableKey?: string;
  getAll: () => Promise<BillingStore>;
  upgrade: (plan: Plan, annual: boolean) => Promise<void>;
  changePlan: (plan: Plan) => Promise<void>;
  editMethod: () => Promise<void>;
  editBilledTo: (
    address: BillingAddress & { businessName: string },
  ) => Promise<void>;
  editEmail: (email: string) => Promise<void>;
  toggleInvoiceEmails?: (checked: boolean) => void;
  editVat?: () => void;
  viewInvoice?: () => void;
}

export interface SettingsAdapters {
  account?: AccountAdapter;
  sessions?: SessionsAdapter;
  passkeys?: PasskeysAdapter;
  connections?: ConnectionsAdapter;
  workspace?: WorkspaceAdapter;
  people?: PeopleAdapter;
  invitations?: InvitationsAdapter;
  teamspaces?: TeamspacesAdapter;
  emoji?: EmojiAdapter;
  billing?: BillingAdapter;
  /** Shared utilities */
  uploadFile?: (file: File) => Promise<void>;
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

export interface UpgradePlan {
  name: string;
  monthly: number;
  annual: number;
}

export const upgradeSchema = z.object({
  name: z.string(),
  businessName: z.string(),
  vatId: z.string(),
  billingInterval: z.enum(["month", "year"]),
  termsAccepted: z.literal(true, {
    error: "You must accept the terms to continue",
  }),
});

export type UpgradeSchema = z.infer<typeof upgradeSchema>;
