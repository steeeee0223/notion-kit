import { Role, type User } from "@notion-kit/schemas";
import {
  MembersTable,
  MemberTeamspace,
  Scope,
  type MemberRow,
} from "@notion-kit/settings-panel";
import { randomItem } from "@notion-kit/utils";

const scopes = new Set(Object.values(Scope));
const users: User[] = [
  {
    id: "user1",
    name: "John Wick",
    avatarUrl: "https://avatarfiles.alphacoders.com/342/thumb-1920-342585.jpg",
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
    name: "Gopher",
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Go_gopher_favicon.svg/1200px-Go_gopher_favicon.svg.png",
    email: "gopher@example.com",
  },
];

const generateMembers = (users: User[]) => {
  const teamspaces: MemberTeamspace[] = [
    {
      id: "t1",
      memberCount: 26,
      name: "Dev Lab",
      icon: { type: "text", src: "D" },
    },
    {
      id: "t2",
      memberCount: 3,
      name: "Private group",
      icon: { type: "text", src: "P" },
    },
    {
      id: "t3",
      memberCount: 44,
      name: "Teamspace",
      icon: { type: "text", src: "T" },
    },
  ];

  return users.map<MemberRow>((user) => ({
    user,
    role: randomItem([Role.OWNER, Role.MEMBER]),
    teamspaces,
    groups: { current: null, options: [] },
  }));
};

export default function Demo() {
  return <MembersTable data={generateMembers(users)} scopes={scopes} />;
}
