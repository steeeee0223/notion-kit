import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod/v4";

import type { DB } from "@/db/db";
import { invitation as invitationTable, team as teamTable } from "@/db/schemas";

import { roles } from "../permissions";
import { requireOrganizationAccess, resourceIdSchema } from "./resource-access";

const organizationRoleSchema = z.enum(["owner", "admin", "member", "guest"]);

export function organizationExtra({
  db,
  billingEnabled,
}: {
  db: DB;
  billingEnabled: boolean;
}) {
  return {
    id: "organization-extra",
    schema: {
      teamMember: {
        fields: {
          role: {
            type: ["owner", "member"],
            required: true,
            defaultValue: "member",
            input: false,
          },
        },
      },
    },
    endpoints: {
      getWorkspaceDetail: createAuthEndpoint(
        "/organization-extra/get-workspace-detail",
        {
          method: "GET",
          query: z.object({ organizationId: resourceIdSchema }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;

          const userId = session.user.id;
          const orgId = ctx.query.organizationId;

          const member = await ctx.context.adapter.findOne<{
            role: string;
          }>({
            model: "member",
            where: [
              { field: "organizationId", value: orgId },
              { field: "userId", value: userId },
            ],
          });

          if (!member) {
            throw new APIError("FORBIDDEN", {
              message: "Organization membership required",
            });
          }

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

          let plan = "free";
          if (billingEnabled) {
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
          }

          return ctx.json({
            id: org.id,
            name: org.name,
            slug: org.slug,
            logo: org.logo,
            metadata: org.metadata,
            role: member.role,
            plan,
          });
        },
      ),

      listTeamsWithMembers: createAuthEndpoint(
        "/organization-extra/list-teams-with-members",
        {
          method: "GET",
          query: z.object({ organizationId: resourceIdSchema }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          await requireOrganizationAccess(
            ctx.context,
            ctx.context.session.user.id,
            ctx.query.organizationId,
          );
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

      listInvitationsWithInviter: createAuthEndpoint(
        "/organization-extra/list-invitations-with-inviter",
        {
          method: "GET",
          query: z.object({ organizationId: resourceIdSchema }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          await requireOrganizationAccess(
            ctx.context,
            ctx.context.session.user.id,
            ctx.query.organizationId,
          );
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

      updateTeamMember: createAuthEndpoint(
        "/organization-extra/update-team-member",
        {
          method: "POST",
          body: z.object({
            teamId: resourceIdSchema,
            userId: resourceIdSchema,
            role: z.enum(["owner", "member"]),
          }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const team = await ctx.context.adapter.findOne<{
            organizationId: string;
          }>({
            model: "team",
            where: [{ field: "id", value: ctx.body.teamId }],
          });
          if (!team)
            throw new APIError("NOT_FOUND", { message: "Team not found" });
          const caller = await ctx.context.adapter.findOne<{ role: string }>({
            model: "member",
            where: [
              { field: "organizationId", value: team.organizationId },
              { field: "userId", value: ctx.context.session.user.id },
            ],
          });
          if (
            !caller?.role.split(",").some((role) => {
              const parsed = organizationRoleSchema.safeParse(role);
              return (
                parsed.success &&
                roles[parsed.data].authorize({ team: ["update"] }).success
              );
            })
          ) {
            throw new APIError("FORBIDDEN", {
              message: "Team update permission required",
            });
          }
          await requireOrganizationAccess(
            ctx.context,
            ctx.body.userId,
            team.organizationId,
          );
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
            throw new APIError("NOT_FOUND", {
              message: "Team member not found",
            });
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
