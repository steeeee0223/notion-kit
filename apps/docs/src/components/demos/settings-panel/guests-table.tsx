import type { User } from "@notion-kit/schemas";
import {
  GuestsTable,
  Scope,
  type GuestRow,
  type PageAccess,
} from "@notion-kit/settings-panel";

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

const generateGuests = (users: User[]) => {
  const access: PageAccess[] = [
    { id: "p1", name: "Page 1", scope: "All" },
    { id: "p2", name: "Page 2", scope: "Can view" },
    { id: "p3", name: "Page 3", scope: "Can comment" },
  ];

  return users.map<GuestRow>((user) => ({ user, access }));
};

export default function Demo() {
  return <GuestsTable data={generateGuests(users)} scopes={scopes} />;
}
