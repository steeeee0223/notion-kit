import { Plan, Role } from "@notion-kit/schemas";

import { Scope } from "./types";

export const SCOPES: Record<Role, Record<Plan, Set<Scope>>> = {
  [Role.GUEST]: {
    [Plan.FREE]: new Set([]),
    [Plan.EDUCATION]: new Set([]),
    [Plan.PLUS]: new Set([]),
    [Plan.BUSINESS]: new Set([]),
    [Plan.ENTERPRISE]: new Set([]),
  },
  [Role.MEMBER]: {
    [Plan.FREE]: new Set([Scope.MemberRead, Scope.MemberAddRequest]),
    [Plan.EDUCATION]: new Set([Scope.MemberRead]),
    [Plan.PLUS]: new Set([
      Scope.MemberRead,
      Scope.MemberAddRequest,
      Scope.GroupEnable,
    ]),
    [Plan.BUSINESS]: new Set([
      Scope.MemberRead,
      Scope.MemberAddRequest,
      Scope.GroupEnable,
    ]),
    [Plan.ENTERPRISE]: new Set([
      Scope.MemberRead,
      Scope.MemberAddRequest,
      Scope.GroupEnable,
    ]),
  },
  [Role.OWNER]: {
    [Plan.FREE]: new Set([
      Scope.WorkspaceUpdate,
      Scope.MemberInvite,
      Scope.MemberRead,
      Scope.MemberAdd,
      Scope.MemberUpdate,
      Scope.Upgrade,
    ]),
    [Plan.EDUCATION]: new Set([
      Scope.WorkspaceUpdate,
      Scope.MemberRead,
      Scope.MemberUpdate,
      Scope.Upgrade,
    ]),
    [Plan.PLUS]: new Set([
      Scope.WorkspaceUpdate,
      Scope.MemberInvite,
      Scope.MemberRead,
      Scope.MemberAdd,
      Scope.MemberUpdate,
      Scope.GroupEnable,
      Scope.Upgrade,
    ]),
    [Plan.BUSINESS]: new Set([
      Scope.WorkspaceUpdate,
      Scope.MemberInvite,
      Scope.MemberRead,
      Scope.MemberAdd,
      Scope.MemberUpdate,
      Scope.GroupEnable,
      Scope.Upgrade,
    ]),
    [Plan.ENTERPRISE]: new Set([
      Scope.WorkspaceUpdate,
      Scope.MemberInvite,
      Scope.MemberRead,
      Scope.MemberAdd,
      Scope.MemberUpdate,
      Scope.GroupEnable,
      Scope.Upgrade,
    ]),
  },
  [Role.ADMIN]: {
    [Plan.FREE]: new Set([]),
    [Plan.EDUCATION]: new Set([]),
    [Plan.PLUS]: new Set([]),
    [Plan.BUSINESS]: new Set([
      Scope.WorkspaceUpdate,
      Scope.MemberInvite,
      Scope.MemberRead,
      Scope.MemberAdd,
      Scope.MemberUpdate,
      Scope.GroupEnable,
      Scope.Upgrade,
    ]),
    [Plan.ENTERPRISE]: new Set([
      Scope.WorkspaceUpdate,
      Scope.MemberInvite,
      Scope.MemberRead,
      Scope.MemberAdd,
      Scope.MemberUpdate,
      Scope.GroupEnable,
      Scope.Upgrade,
    ]),
  },
};

export function getScopes(plan: Plan, role: Role): Set<Scope> {
  return SCOPES[role][plan];
}
