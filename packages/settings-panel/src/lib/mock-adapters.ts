import type {
  AccountAdapter,
  BillingAdapter,
  BillingStore,
  Connection,
  ConnectionsAdapter,
  Invitations,
  InvitationsAdapter,
  Memberships,
  Passkey,
  PasskeysAdapter,
  PeopleAdapter,
  SessionRow,
  SessionsAdapter,
  SettingsAdapters,
  SettingsStore,
  Teamspaces,
  TeamspacesAdapter,
  WorkspaceAdapter,
} from "./types";

type Setter<T> = (fn: (prev: T) => T) => void;

function delay(ms = 300) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function createMockAccountAdapter(
  setSettings: Setter<SettingsStore>,
): AccountAdapter {
  return {
    update: async (data) => {
      await delay();
      setSettings((prev) => ({
        ...prev,
        account: { ...prev.account, ...data },
      }));
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
  setSettings: Setter<SettingsStore>,
): WorkspaceAdapter {
  return {
    update: async (data) => {
      await delay();
      setSettings((prev) => ({
        ...prev,
        workspace: { ...prev.workspace, ...data },
      }));
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

export function createMockBillingAdapter(): BillingAdapter {
  let store: BillingStore = {};
  return {
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

export interface CreateMockAdaptersOptions {
  setSettings: Setter<SettingsStore>;
  sessions?: SessionRow[];
  passkeys?: Passkey[];
  connections?: Connection[];
  memberships?: Memberships;
  invitations?: Invitations;
  teamspaces?: Teamspaces;
}

export function createMockAdapters({
  setSettings,
  sessions = [],
  passkeys = [],
  connections = [],
  memberships = {},
  invitations = {},
  teamspaces = {},
}: CreateMockAdaptersOptions): SettingsAdapters {
  return {
    account: createMockAccountAdapter(setSettings),
    sessions: createMockSessionsAdapter(sessions),
    passkeys: createMockPasskeysAdapter(passkeys),
    connections: createMockConnectionsAdapter(connections),
    workspace: createMockWorkspaceAdapter(setSettings),
    people: createMockPeopleAdapter(memberships),
    invitations: createMockInvitationsAdapter(invitations),
    teamspaces: createMockTeamspacesAdapter(teamspaces),
    billing: createMockBillingAdapter(),
  };
}
