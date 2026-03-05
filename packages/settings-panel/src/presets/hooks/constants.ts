import { Plan, Role } from "@notion-kit/schemas";

import type { AccountStore, BillingStore, WorkspaceStore } from "@/lib/types";

export const initialAccountStore: AccountStore = {
  preferredName: "",
  id: "",
  name: "",
  email: "",
  avatarUrl: "",
};

export const initialWorkspaceStore: WorkspaceStore = {
  id: "",
  name: "",
  icon: { type: "text", src: "" },
  slug: "",
  inviteLink: "",
  plan: Plan.FREE,
  role: Role.OWNER,
};

export const initialBillingStore: BillingStore = {};
