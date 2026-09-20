"use client";

import { useMemo } from "react";
import { z } from "zod/v4";

import type {
  Invitations,
  InvitationsAdapter,
} from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";
import { displayRole } from "./utils";

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
          throw new Error(res.error.message);
        }
        return res.data.reduce<Invitations>((acc, inv) => {
          acc[inv.id] = {
            id: inv.id,
            email: inv.email,
            role: displayRole(inv.role),
            status: z
              .enum(["pending", "rejected", "canceled"])
              .parse(inv.status),
            invitedBy: inv.inviter,
          };
          return acc;
        }, {});
      },
      add: async ({ emails, role }) => {
        const results = await Promise.allSettled(
          emails.map((email) =>
            orgApi.inviteMember(
              { organizationId, email, role, resend: true },
              { throw: true },
            ),
          ),
        );
        const failure = results.find((result) => result.status === "rejected");
        if (failure) throw failure.reason;
      },
      cancel: async (invitationId) => {
        await orgApi.cancelInvitation({ invitationId }, { throw: true });
      },
    };
  }, [orgApi, orgExtraApi, organizationId]);
}
