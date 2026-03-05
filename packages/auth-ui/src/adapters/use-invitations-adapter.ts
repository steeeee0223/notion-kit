"use client";

import { useMemo } from "react";

import { Role } from "@notion-kit/schemas";
import type {
  Invitations,
  InvitationsAdapter,
} from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";
import { handleError } from "../lib";

export function useInvitationsAdapter(): InvitationsAdapter | undefined {
  const { auth } = useAuth();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const orgApi = auth.organization;

  return useMemo<InvitationsAdapter | undefined>(() => {
    if (!organizationId) return undefined;
    return {
      getAll: async () => {
        const res = await orgApi.listInvitations({
          query: { organizationId },
        });
        if (res.error) {
          handleError(res, "Fetch invitations failed");
          return {};
        }
        const invitations: Invitations = {};
        const invitationMap: Record<string, string[]> = {};
        res.data.forEach((invitation) => {
          if (invitation.status === "accepted") return;
          if (invitationMap[invitation.inviterId]) {
            invitationMap[invitation.inviterId]!.push(invitation.id);
          } else {
            invitationMap[invitation.inviterId] = [invitation.id];
          }
          invitations[invitation.id] = {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role as Role,
            status: invitation.status,
            invitedBy: {
              id: invitation.inviterId,
              name: "Unknown",
              email: "",
              avatarUrl: "",
            },
          };
        });
        const members = await orgApi.listMembers({
          query: { organizationId },
        });
        if (members.error) {
          console.error(`[invitations:getAll] Fetch error`, members.error);
          return invitations;
        }
        members.data.members.forEach((mem) => {
          const invitationIds = invitationMap[mem.userId];
          if (!invitationIds) return;
          invitationIds.forEach((invitationId) => {
            invitations[invitationId]!.invitedBy = {
              id: mem.userId,
              name: mem.user.name,
              email: mem.user.email,
              avatarUrl: mem.user.image ?? "",
            };
          });
        });
        return invitations;
      },
      add: async ({ emails, role }) => {
        await Promise.all(
          emails.map((email) =>
            orgApi.inviteMember(
              { organizationId, email, role, resend: true },
              { throw: true },
            ),
          ),
        );
      },
      cancel: async (invitationId) => {
        await orgApi.cancelInvitation({ invitationId }, { throw: true });
      },
    };
  }, [orgApi, organizationId]);
}
