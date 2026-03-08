import type {
  AccountAdapter,
  AccountStore,
  BillingAdapter,
  BillingStore,
  Connection,
  ConnectionsAdapter,
  EmojiAdapter,
  Emojis,
  Invitations,
  InvitationsAdapter,
  Memberships,
  Passkey,
  PasskeysAdapter,
  PeopleAdapter,
  SessionRow,
  SessionsAdapter,
  SettingsAdapters,
  Teamspaces,
  TeamspacesAdapter,
  WorkspaceAdapter,
  WorkspaceStore,
} from "./types";

function delay(ms = 300) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function createMockAccountAdapter(
  initialAccount: AccountStore,
): AccountAdapter {
  let account = { ...initialAccount };
  return {
    getAll: () => Promise.resolve(account),
    update: async (data) => {
      await delay();
      account = { ...account, ...data };
    },
    delete: async () => {
      await delay();
    },
    sendEmailVerification: async () => {
      await delay();
    },
    changePassword: async () => {
      await delay();
    },
  };
}

export function createMockSessionsAdapter(
  initialSessions: SessionRow[],
): SessionsAdapter {
  let sessions = [...initialSessions];
  return {
    getAll: () => Promise.resolve(sessions),
    delete: async (token) => {
      await delay();
      sessions = sessions.filter((s) => s.token !== token);
    },
    deleteAll: async () => {
      await delay();
      sessions = sessions.slice(0, 1);
    },
  };
}

export function createMockPasskeysAdapter(
  initialPasskeys: Passkey[],
): PasskeysAdapter {
  let passkeys = [...initialPasskeys];
  let nextId = passkeys.length + 1;
  return {
    getAll: () => Promise.resolve(passkeys),
    add: async () => {
      await delay();
      passkeys.push({
        id: `p-${nextId++}`,
        name: `New Passkey ${nextId}`,
        createdAt: Date.now(),
      });
      return true;
    },
    update: async ({ id, name }) => {
      await delay();
      passkeys = passkeys.map((p) => (p.id === id ? { ...p, name } : p));
    },
    delete: async (id) => {
      await delay();
      passkeys = passkeys.filter((p) => p.id !== id);
    },
  };
}

export function createMockConnectionsAdapter(
  initialConnections: Connection[],
): ConnectionsAdapter {
  let connections = [...initialConnections];
  let nextId = connections.length + 1;
  return {
    getAll: () => Promise.resolve(connections),
    add: async (strategy) => {
      await delay();
      connections.push({
        id: `c-${nextId++}`,
        connection: { type: strategy, account: "mock@example.com" },
        scopes: ["Can preview links"],
      });
    },
    delete: async (connection) => {
      await delay();
      connections = connections.filter((c) => c.id !== connection.id);
    },
  };
}

export function createMockWorkspaceAdapter(
  initialWorkspace: WorkspaceStore,
): WorkspaceAdapter {
  let workspace = { ...initialWorkspace };
  return {
    getAll: () => Promise.resolve(workspace),
    update: async (data) => {
      await delay();
      workspace = { ...workspace, ...data };
    },
    delete: async () => {
      await delay();
    },
    leave: async () => {
      await delay();
    },
    resetLink: async () => {
      await delay();
    },
  };
}

export function createMockPeopleAdapter(
  initialMemberships: Memberships,
): PeopleAdapter {
  let memberships = { ...initialMemberships };
  return {
    getAll: () => Promise.resolve(memberships),
    update: async ({ id, role }) => {
      await delay();
      const member = memberships[id];
      if (member) {
        memberships = { ...memberships, [id]: { ...member, role } };
      }
    },
    delete: async ({ id }) => {
      await delay();
      const updated = { ...memberships };
      delete updated[id];
      memberships = updated;
    },
  };
}

export function createMockInvitationsAdapter(
  initialInvitations: Invitations,
): InvitationsAdapter {
  let invitations = { ...initialInvitations };
  let nextId = Object.keys(invitations).length + 1;
  return {
    getAll: () => Promise.resolve(invitations),
    add: async ({ emails, role }) => {
      await delay();
      emails.forEach((email) => {
        const id = `i-${nextId++}`;
        invitations = {
          ...invitations,
          [id]: {
            id,
            email,
            role,
            status: "pending",
            invitedBy: {
              id: "system",
              name: "System",
              email: "",
              avatarUrl: "",
            },
          },
        };
      });
    },
    cancel: async (invitationId) => {
      await delay();
      const updated = { ...invitations };
      delete updated[invitationId];
      invitations = updated;
    },
  };
}

export function createMockTeamspacesAdapter(
  initialTeamspaces: Teamspaces,
): TeamspacesAdapter {
  let teamspaces = { ...initialTeamspaces };
  let nextId = Object.keys(teamspaces).length + 1;
  return {
    getAll: () => Promise.resolve(teamspaces),
    add: async ({ name, icon, description, permission }) => {
      await delay();
      const id = `team-${nextId++}`;
      teamspaces = {
        ...teamspaces,
        [id]: {
          id,
          name,
          icon,
          description,
          permission,
          ownedBy: "mock",
          members: [],
          updatedAt: Date.now(),
        },
      };
    },
    update: async ({ id, ...data }) => {
      await delay();
      const ts = teamspaces[id];
      if (ts) {
        teamspaces = {
          ...teamspaces,
          [id]: { ...ts, ...data, updatedAt: Date.now() },
        };
      }
    },
    delete: async (id) => {
      await delay();
      const updated = { ...teamspaces };
      delete updated[id];
      teamspaces = updated;
    },
    leave: async (id) => {
      await delay();
      const ts = teamspaces[id];
      if (ts) {
        teamspaces = {
          ...teamspaces,
          [id]: { ...ts, members: [] },
        };
      }
    },
    addMembers: async ({ teamspaceId, userIds, role }) => {
      await delay();
      const ts = teamspaces[teamspaceId];
      if (ts) {
        teamspaces = {
          ...teamspaces,
          [teamspaceId]: {
            ...ts,
            members: [
              ...ts.members,
              ...userIds.map((userId) => ({ userId, role })),
            ],
          },
        };
      }
    },
    updateMember: async ({ teamspaceId, userId, role }) => {
      await delay();
      const ts = teamspaces[teamspaceId];
      if (ts) {
        teamspaces = {
          ...teamspaces,
          [teamspaceId]: {
            ...ts,
            members: ts.members.map((m) =>
              m.userId === userId ? { ...m, role } : m,
            ),
          },
        };
      }
    },
    deleteMember: async ({ teamspaceId, userId }) => {
      await delay();
      const ts = teamspaces[teamspaceId];
      if (ts) {
        teamspaces = {
          ...teamspaces,
          [teamspaceId]: {
            ...ts,
            members: ts.members.filter((m) => m.userId !== userId),
          },
        };
      }
    },
  };
}

export function createMockBillingAdapter(
  stripePublishableKey?: string,
): BillingAdapter {
  let store: BillingStore = {};
  return {
    stripePublishableKey,
    getAll: () => Promise.resolve(store),
    upgrade: async () => {
      await delay();
    },
    changePlan: async () => {
      await delay();
    },
    editMethod: async () => {
      await delay();
    },
    editBilledTo: async () => {
      await delay();
    },
    editEmail: async (email) => {
      await delay();
      store = { ...store, billingEmail: email };
    },
    toggleInvoiceEmails: (checked) => {
      store = { ...store, invoiceEmails: checked };
    },
  };
}

export function createMockEmojiAdapter(initialEmojis: Emojis): EmojiAdapter {
  let emojis = { ...initialEmojis };
  let nextId = Object.keys(emojis).length + 1;
  return {
    getAll: () => Promise.resolve(emojis),
    add: async ({ name, file }) => {
      await delay();
      const id = `emoji-${nextId++}`;
      emojis = {
        ...emojis,
        [id]: {
          id,
          name,
          src: URL.createObjectURL(file),
          createdBy: "Mock User",
          createdAt: Date.now(),
        },
      };
    },
    update: async ({ id, name, file }) => {
      await delay();
      const emoji = emojis[id];
      if (emoji) {
        emojis = {
          ...emojis,
          [id]: {
            ...emoji,
            ...(name !== undefined && { name }),
            ...(file && { src: URL.createObjectURL(file) }),
          },
        };
      }
    },
    delete: async (id) => {
      await delay();
      const updated = { ...emojis };
      delete updated[id];
      emojis = updated;
    },
  };
}

export interface CreateMockAdaptersOptions {
  account: AccountStore;
  workspace: WorkspaceStore;
  sessions?: SessionRow[];
  passkeys?: Passkey[];
  connections?: Connection[];
  memberships?: Memberships;
  invitations?: Invitations;
  teamspaces?: Teamspaces;
  emojis?: Emojis;
  stripePublishableKey?: string;
}

export function createMockAdapters({
  account,
  workspace,
  sessions = [],
  passkeys = [],
  connections = [],
  memberships = {},
  invitations = {},
  teamspaces = {},
  emojis = {},
  stripePublishableKey,
}: CreateMockAdaptersOptions): SettingsAdapters {
  return {
    account: createMockAccountAdapter(account),
    sessions: createMockSessionsAdapter(sessions),
    passkeys: createMockPasskeysAdapter(passkeys),
    connections: createMockConnectionsAdapter(connections),
    workspace: createMockWorkspaceAdapter(workspace),
    people: createMockPeopleAdapter(memberships),
    invitations: createMockInvitationsAdapter(invitations),
    teamspaces: createMockTeamspacesAdapter(teamspaces),
    emoji: createMockEmojiAdapter(emojis),
    billing: createMockBillingAdapter(stripePublishableKey),
  };
}
