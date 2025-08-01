import { Plan, Role, type User, type Workspace } from "@notion-kit/schemas";
import type {
  Connection,
  Passkey,
  SessionRow,
  SettingsStore,
  WorkspaceMemberships,
} from "@notion-kit/settings-panel";
import { randomItem } from "@notion-kit/utils";

const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Wick",
    avatarUrl:
      "https://notion-avatar.app/api/svg/eyJmYWNlIjoxMCwibm9zZSI6MSwibW91dGgiOjE1LCJleWVzIjo2LCJleWVicm93cyI6MiwiZ2xhc3NlcyI6NywiaGFpciI6MiwiYWNjZXNzb3JpZXMiOjAsImRldGFpbHMiOjAsImJlYXJkIjowLCJmbGlwIjowLCJjb2xvciI6InJnYmEoMjU1LCAwLCAwLCAwKSIsInNoYXBlIjoibm9uZSJ9",
    email: "john-wick@example.com",
  },
  {
    id: "user2",
    name: "ShadCN",
    avatarUrl: "https://github.com/shadcn.png",
    email: "shadcn@example.com",
  },
  {
    id: "user3",
    name: "Pong",
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Go_gopher_favicon.svg/1200px-Go_gopher_favicon.svg.png",
    email: "pong@example.com",
  },
  {
    id: "user4",
    name: "Charlie Layne",
    email: "charlie.layne@example.com",
    avatarUrl: "https://liveblocks.io/avatars/avatar-1.png",
  },
  {
    id: "user5",
    name: "Mislav Abha",
    email: "mislav.abha@example.com",
    avatarUrl: "https://liveblocks.io/avatars/avatar-2.png",
  },
  {
    id: "user6",
    name: "Tatum Paolo",
    email: "tatum-paolo@example.com",
    avatarUrl: "https://liveblocks.io/avatars/avatar-3.png",
  },
  {
    id: "user7",
    name: "Anjali Wanda",
    email: "anjali-wanda@example.com",
    avatarUrl: "https://liveblocks.io/avatars/avatar-4.png",
  },
  {
    id: "user8",
    name: "Jody Hekla",
    email: "jody-hekla@example.com",
    avatarUrl: "https://liveblocks.io/avatars/avatar-5.png",
  },
  {
    id: "user9",
    name: "Emil Joyce",
    email: "emil-joyce@example.com",
    avatarUrl: "https://liveblocks.io/avatars/avatar-6.png",
  },
  {
    id: "user10",
    name: "Jory Quispe",
    email: "jory-quispe@example.com",
    avatarUrl: "https://liveblocks.io/avatars/avatar-7.png",
  },
  {
    id: "user11",
    name: "Quinn Elton",
    email: "quinn-elton@example.com",
    avatarUrl: "https://liveblocks.io/avatars/avatar-8.png",
  },
] as const;

export const mockUser = mockUsers[0]!;

export const mockWorkspaces: Workspace[] = [
  {
    id: "workspace-0",
    name: "John's Private",
    icon: { type: "lucide", src: "activity", color: "#CB912F" },
    memberCount: 1,
    plan: Plan.EDUCATION,
    role: Role.OWNER,
  },
  {
    id: "workspace-1",
    name: "Workspace 1",
    icon: { type: "lucide", src: "briefcase", color: "#337EA9" },
    memberCount: 3,
    plan: Plan.FREE,
    role: Role.OWNER,
  },
  {
    id: "workspace-2",
    name: "Workspace 2",
    icon: { type: "emoji", src: "🎨" },
    memberCount: 2,
    plan: Plan.BUSINESS,
    role: Role.MEMBER,
  },
  {
    id: "workspace-3",
    name: "Workspace 3",
    icon: { type: "emoji", src: "🚧" },
    memberCount: 8,
    plan: Plan.ENTERPRISE,
    role: Role.GUEST,
  },
];

const pageAccesses = [
  [
    { id: "page1", name: "Page 1", scope: "Full access" },
    { id: "page2", name: "Page 2", scope: "Can view" },
  ],
  [
    { id: "page1", name: "Page 1", scope: "Can view" },
    { id: "page2", name: "Page 2", scope: "Can view" },
  ],
  [{ id: "page1", name: "Page 1", scope: "Can view" }],
  [],
];

export const mockSessions: SessionRow[] = [
  {
    id: "session-1",
    type: "laptop",
    device: "MacBook Pro",
    lastActive: Date.UTC(2023, 9, 1, 12, 0, 0),
    location: "New York, USA",
    token: "token-1",
  },
  {
    id: "session-2",
    device: "iPhone 14",
    type: "mobile",
    lastActive: Date.UTC(2023, 9, 2, 14, 30, 0),
    location: "San Francisco, USA",
    token: "token-2",
  },
  {
    id: "session-3",
    device: "iPad Pro",
    type: "mobile",
    lastActive: Date.UTC(2023, 9, 3, 9, 15, 0),
    location: "Los Angeles, USA",
    token: "token-3",
  },
  {
    id: "session-4",
    device: "Windows PC",
    type: "unknown",
    lastActive: Date.UTC(2023, 9, 4, 18, 45, 0),
    location: "Chicago, USA",
    token: "token-4",
  },
];

export const mockSettings: SettingsStore = {
  workspace: {
    ...mockWorkspaces[0]!,
    icon: mockWorkspaces[0]!.icon ?? {
      type: "text",
      src: mockWorkspaces[0]!.name,
    },
    plan: Plan.FREE,
    domain: "fake-domain",
    inviteLink: "#",
  },
  account: {
    ...mockUsers[0]!,
    preferredName: "Jonathan",
    language: "en",
    currentSessionId: mockSessions[0]!.id,
  },
  memberships: mockUsers.reduce(
    (acc, user, i) => ({
      ...acc,
      get [user.id]() {
        switch (i) {
          case 0:
            return {
              user,
              teamspaces: {
                current: "1",
                options: [{ id: "1", name: "General", members: 29 }],
              },
              groups: { current: null, options: [] },
              role: Role.OWNER,
            };
          case 1:
            return {
              user,
              teamspaces: { current: null, options: [] },
              groups: { current: null, options: [] },
              role: Role.MEMBER,
            };
          default:
            return {
              role: Role.GUEST,
              user,
              access: randomItem(pageAccesses),
            };
        }
      },
    }),
    {},
  ),
};

export const mockMemberships = Object.values(
  mockSettings.memberships,
).reduce<WorkspaceMemberships>(
  (acc, mem) =>
    mem.role === Role.GUEST
      ? { members: acc.members, guests: [...acc.guests, mem] }
      : { members: [...acc.members, mem], guests: acc.guests },
  { members: [], guests: [] },
);

export const mockConnections: Connection[] = [
  {
    id: "c1",
    connection: { type: "slack", account: "steeeee@example.com" },
    scopes: ["Can preview links"],
  },
  {
    id: "c2",
    connection: { type: "github", account: "steeeee0913" },
    scopes: ["Can preview links", "Can content"],
  },
  {
    id: "c3",
    connection: { type: "jira", account: "steeeee@example.com" },
    scopes: ["Can preview links and sync databases"],
  },
];

export const mockPasskeys: Passkey[] = [
  { id: "p-1", name: "My Laptop", createdAt: Date.UTC(2023, 10, 1) },
  { id: "p-2", name: "My Phone", createdAt: Date.UTC(2023, 10, 2) },
  { id: "p-3", name: "My Tablet", createdAt: Date.UTC(2023, 10, 3) },
];
