import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod/v4";

export function organizationExtra() {
  return {
    id: "organization-extra",
    endpoints: {
      getWorkspaceDetail: createAuthEndpoint(
        "/organization-extra/get-workspace-detail",
        {
          method: "GET",
          query: z.object({ organizationId: z.string() }),
          requireHeaders: true,
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session) throw new Error("Unauthorized");

          const userId = session.user.id;
          const orgId = ctx.query.organizationId;

          const org = await ctx.context.adapter.findOne<{
            id: string;
            name: string;
            slug: string;
            logo: string | null;
            metadata: string | null;
          }>({
            model: "organization",
            where: [{ field: "id", value: orgId }],
          });
          if (!org) return ctx.json(null);

          const member = await ctx.context.adapter.findOne<{
            role: string;
          }>({
            model: "member",
            where: [
              { field: "organizationId", value: orgId },
              { field: "userId", value: userId },
            ],
          });

          const subscriptions = await ctx.context.adapter.findMany<{
            plan: string;
            status: string | null;
          }>({
            model: "subscription",
            where: [{ field: "referenceId", value: orgId }],
          });
          const active = subscriptions.find(
            (s: { status: string | null }) =>
              s.status === "active" || s.status === "trialing",
          );

          return ctx.json({
            id: org.id,
            name: org.name,
            slug: org.slug,
            logo: org.logo,
            metadata: org.metadata,
            role: member?.role ?? "owner",
            plan: (active as { plan: string } | undefined)?.plan ?? "free",
          });
        },
      ),

      listTeamsWithMembers: createAuthEndpoint(
        "/organization-extra/list-teams-with-members",
        {
          method: "GET",
          query: z.object({ organizationId: z.string() }),
          requireHeaders: true,
        },
        async (ctx) => {
          const orgId = ctx.query.organizationId;

          const teams = await ctx.context.adapter.findMany<{
            id: string;
            name: string;
            icon: string;
            description: string | null;
            permission: string;
            ownedBy: string;
            createdAt: Date;
            updatedAt: Date | null;
          }>({
            model: "team",
            where: [{ field: "organizationId", value: orgId }],
          });

          const members = await Promise.all(
            teams.map((team: { id: string }) =>
              ctx.context.adapter.findMany<{
                userId: string;
                role: string;
              }>({
                model: "teamMember",
                where: [{ field: "teamId", value: team.id }],
              }),
            ),
          );

          return ctx.json(
            teams.map((team: Record<string, unknown>, i: number) => ({
              id: team.id as string,
              name: team.name as string,
              icon: team.icon as string,
              description: team.description as string | null,
              permission: team.permission as string,
              ownedBy: team.ownedBy as string,
              createdAt: team.createdAt as Date,
              updatedAt: team.updatedAt as Date | null,
              members: (
                (members[i] ?? []) as { userId: string; role: string }[]
              ).map((m) => ({
                userId: m.userId,
                role: m.role,
              })),
            })),
          );
        },
      ),

      listTeamMembers: createAuthEndpoint(
        "/organization-extra/list-team-members",
        {
          method: "GET",
          query: z.object({ teamId: z.string() }),
          requireHeaders: true,
        },
        async (ctx) => {
          const rows = await ctx.context.adapter.findMany<{
            userId: string;
            role: string;
            createdAt: Date | null;
          }>({
            model: "teamMember",
            where: [{ field: "teamId", value: ctx.query.teamId }],
          });
          return ctx.json(
            rows.map(
              (m: {
                userId: string;
                role: string;
                createdAt: Date | null;
              }) => ({
                userId: m.userId,
                role: m.role,
                createdAt: m.createdAt,
              }),
            ),
          );
        },
      ),

      listInvitationsWithInviter: createAuthEndpoint(
        "/organization-extra/list-invitations-with-inviter",
        {
          method: "GET",
          query: z.object({ organizationId: z.string() }),
          requireHeaders: true,
        },
        async (ctx) => {
          const orgId = ctx.query.organizationId;

          const invitations = await ctx.context.adapter.findMany<{
            id: string;
            email: string;
            role: string | null;
            status: string;
            inviterId: string;
          }>({
            model: "invitation",
            where: [{ field: "organizationId", value: orgId }],
          });

          const pending = invitations.filter(
            (i: { status: string }) => i.status !== "accepted",
          );

          const inviterIds = [
            ...new Set(pending.map((i: { inviterId: string }) => i.inviterId)),
          ];
          const inviters = await Promise.all(
            inviterIds.map((id) =>
              ctx.context.adapter.findOne<{
                id: string;
                name: string;
                email: string;
                image: string | null;
              }>({
                model: "user",
                where: [{ field: "id", value: id }],
              }),
            ),
          );
          const inviterMap = new Map(
            inviterIds.map((id, i) => [id, inviters[i]]),
          );

          return ctx.json(
            pending.map(
              (inv: {
                id: string;
                email: string;
                role: string | null;
                status: string;
                inviterId: string;
              }) => {
                const inviter = inviterMap.get(inv.inviterId);
                return {
                  id: inv.id,
                  email: inv.email,
                  role: inv.role,
                  status: inv.status,
                  inviter: inviter
                    ? {
                        id: inviter.id,
                        name: inviter.name,
                        email: inviter.email,
                        avatarUrl: inviter.image ?? "",
                      }
                    : {
                        id: inv.inviterId,
                        name: "Unknown",
                        email: "",
                        avatarUrl: "",
                      },
                };
              },
            ),
          );
        },
      ),

      addTeamMemberWithRole: createAuthEndpoint(
        "/organization-extra/add-team-member-with-role",
        {
          method: "POST",
          body: z.object({
            teamId: z.string(),
            userId: z.string(),
            role: z.string(),
          }),
          requireHeaders: true,
        },
        async (ctx) => {
          const existing = await ctx.context.adapter.findOne<{
            id: string;
          }>({
            model: "teamMember",
            where: [
              { field: "teamId", value: ctx.body.teamId },
              { field: "userId", value: ctx.body.userId },
            ],
          });
          if (existing) {
            await ctx.context.adapter.update({
              model: "teamMember",
              where: [{ field: "id", value: existing.id }],
              update: { role: ctx.body.role },
            });
            return ctx.json({ ok: true });
          }
          await ctx.context.adapter.create({
            model: "teamMember",
            data: {
              id: crypto.randomUUID(),
              teamId: ctx.body.teamId,
              userId: ctx.body.userId,
              role: ctx.body.role,
              createdAt: new Date(),
            },
          });
          return ctx.json({ ok: true });
        },
      ),

      updateTeamMember: createAuthEndpoint(
        "/organization-extra/update-team-member",
        {
          method: "POST",
          body: z.object({
            teamId: z.string(),
            userId: z.string(),
            role: z.string(),
          }),
          requireHeaders: true,
        },
        async (ctx) => {
          const existing = await ctx.context.adapter.findOne<{
            id: string;
          }>({
            model: "teamMember",
            where: [
              { field: "teamId", value: ctx.body.teamId },
              { field: "userId", value: ctx.body.userId },
            ],
          });
          if (!existing) {
            throw new Error("Team member not found");
          }
          await ctx.context.adapter.update({
            model: "teamMember",
            where: [{ field: "id", value: existing.id }],
            update: { role: ctx.body.role },
          });
          return ctx.json({ ok: true });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
}
