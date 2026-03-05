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
  const orgApi = auth.organization;
  const orgExtraApi = auth.organizationExtra;

  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;

  return useMemo<InvitationsAdapter | undefined>(() => {
    if (!organizationId) return undefined;
    return {
      getAll: async () => {
        const res = await orgExtraApi.listInvitationsWithInviter({
          query: { organizationId },
        });
        if (res.error) {
          handleError(res, "Fetch invitations failed");
          return {};
        }
        return res.data.reduce<Invitations>((acc, inv) => {
          acc[inv.id] = {
            id: inv.id,
            email: inv.email,
            role: inv.role as Role,
            status: inv.status as "pending" | "rejected" | "canceled",
            invitedBy: inv.inviter,
          };
          return acc;
        }, {});
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
  }, [orgApi, orgExtraApi, organizationId]);
}
