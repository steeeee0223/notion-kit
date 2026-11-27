import type { Team as TeamBase } from "better-auth/plugins";

export type {
  Organization,
  TeamMember,
  Member,
  Invitation,
} from "better-auth/plugins";
export type { Passkey } from "@better-auth/passkey";
export type { ErrorContext } from "better-auth/react";

export type Team = TeamBase & {
  icon: string;
  description?: string;
  permission: "default" | "open" | "closed" | "private";
  ownedBy: string;
};
