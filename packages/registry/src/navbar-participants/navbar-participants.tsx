import { Participants } from "@notion-kit/navbar/presets";
import type { User } from "@notion-kit/schemas";
import { TooltipProvider } from "@notion-kit/shadcn";

export const currentUser: User = {
  id: "u1",
  name: "Steve Yu",
  email: "steve@example.com",
  avatarUrl: "",
};

export const otherUsers: User[] = [
  {
    id: "u2",
    name: "Pong",
    email: "pong@example.com",
    avatarUrl: "",
  },
  {
    id: "u3",
    name: "Ming",
    email: "ming@example.com",
    avatarUrl: "",
  },
];

export default function Demo() {
  return (
    <TooltipProvider>
      <Participants currentUser={currentUser} otherUsers={otherUsers} />
    </TooltipProvider>
  );
}
