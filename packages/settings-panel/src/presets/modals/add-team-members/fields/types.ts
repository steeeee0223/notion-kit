import type { User } from "@notion-kit/schemas";

export interface AddTeamMembersOption {
  id: string;
  name: string;
  color: string;
  disabled?: boolean;
  avatarUrl: string;
}

export interface GroupOption {
  label: string;
  items: AddTeamMembersOption[];
}

export interface WorkspaceMember extends User {
  invited?: boolean;
}
