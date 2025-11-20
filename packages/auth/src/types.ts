import type { Team as TeamBase } from "better-auth/plugins";

export type { OAuth2UserInfo } from "better-auth/oauth2";
export type {
  Organization,
  TeamMember,
  Member,
  Invitation,
} from "better-auth/plugins";
export type { Passkey } from "better-auth/plugins/passkey";
export type { ErrorContext } from "better-auth/react";
export type {
  GithubProfile,
  GoogleProfile,
} from "better-auth/social-providers";

export interface WorkspaceMetadata {
  inviteToken?: string;
}
export type Team = TeamBase & {
  icon: string;
  description?: string;
  permission: "default" | "open" | "closed" | "private";
  ownedBy: string;
};
