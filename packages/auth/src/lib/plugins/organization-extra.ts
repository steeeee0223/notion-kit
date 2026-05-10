import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod/v4";

import type { DB } from "@/db/db";
import { invitation as invitationTable, team as teamTable } from "@/db/schemas";

export function organizationExtra({ db }: { db: DB }) {
  return {
    id: "organization-extra",
    endpoints: {
      getWorkspaceDetail: createAuthEndpoint(
        "/organization-extra/get-workspace-detail",
        {
          method: "GET",
          query: z.object({ organizationId: z.string() }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;

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

          let plan = "free";
          try {
            const subscriptions = await ctx.context.adapter.findMany<{
              plan: string;
              status: string | null;
            }>({
              model: "subscription",
              where: [{ field: "referenceId", value: orgId }],
            });
            const active = subscriptions.find(
              (s) => s.status === "active" || s.status === "trialing",
            );
            if (active) plan = active.plan;
          } catch {
            // Stripe plugin not loaded — subscription model unavailable
          }

          return ctx.json({
            id: org.id,
            name: org.name,
            slug: org.slug,
            logo: org.logo,
            metadata: org.metadata,
            role: member?.role ?? "owner",
            plan,
          });
        },
      ),

      listTeamsWithMembers: createAuthEndpoint(
        "/organization-extra/list-teams-with-members",
        {
          method: "GET",
          query: z.object({ organizationId: z.string() }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const teams = await db.query.team.findMany({
            where: eq(teamTable.organizationId, ctx.query.organizationId),
            with: {
              teamMembers: { columns: { userId: true, role: true } },
            },
          });

          return ctx.json(
            teams.map((t) => ({
              id: t.id,
              name: t.name,
              icon: t.icon,
              description: t.description,
              permission: t.permission,
              ownedBy: t.ownedBy,
              createdAt: t.createdAt,
              updatedAt: t.updatedAt,
              members: t.teamMembers,
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
          use: [sessionMiddleware],
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
          return ctx.json(rows);
        },
      ),

      listInvitationsWithInviter: createAuthEndpoint(
        "/organization-extra/list-invitations-with-inviter",
        {
          method: "GET",
          query: z.object({ organizationId: z.string() }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const rows = await db.query.invitation.findMany({
            where: and(
              eq(invitationTable.organizationId, ctx.query.organizationId),
              ne(invitationTable.status, "accepted"),
            ),
            with: {
              user: {
                columns: { id: true, name: true, email: true, image: true },
              },
            },
          });

          return ctx.json(
            rows.map((inv) => ({
              id: inv.id,
              email: inv.email,
              role: inv.role,
              status: inv.status,
              inviter: {
                id: inv.user.id,
                name: inv.user.name,
                email: inv.user.email,
                avatarUrl: inv.user.image ?? "",
              },
            })),
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
          use: [sessionMiddleware],
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
          use: [sessionMiddleware],
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
