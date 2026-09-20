import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { bearer, organization } from "better-auth/plugins";
import { describe, expect, it, vi } from "vitest";

import type { DB } from "../../db/db";
import { roles } from "../permissions";
import { organizationExtra } from "./organization-extra";

async function setup(role = "owner", billingEnabled = false) {
  const data: Record<string, Record<string, unknown>[]> = {
    user: [],
    session: [],
    account: [],
    verification: [],
    organization: [],
    member: [],
    invitation: [],
    team: [],
    teamMember: [],
  };
  const db = {
    query: {
      team: { findMany: vi.fn().mockResolvedValue([]) },
      invitation: { findMany: vi.fn().mockResolvedValue([]) },
    },
  };
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "organization-extra-test-secret-at-least-32",
    database: memoryAdapter(data),
    emailAndPassword: { enabled: true },
    plugins: [
      bearer(),
      organizationExtra({ db: db as unknown as DB, billingEnabled }),
      organization({ roles, teams: { enabled: true } }),
    ],
  });
  const result = await auth.api.signUpEmail({
    body: {
      email: "caller@example.test",
      password: "password12345",
      name: "Caller",
    },
  });
  data.user!.push({
    id: "target",
    email: "target@example.test",
    name: "Target",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  data.organization = ["org-a", "org-b"].map((id) => ({
    id,
    name: id,
    slug: id,
    createdAt: new Date(),
  }));
  data.member = [
    {
      id: "caller-member",
      organizationId: "org-a",
      userId: result.user.id,
      role,
      createdAt: new Date(),
    },
    {
      id: "target-member",
      organizationId: "org-a",
      userId: "target",
      role: "member",
      createdAt: new Date(),
    },
  ];
  data.team = [
    {
      id: "team-a",
      name: "Team A",
      organizationId: "org-a",
      createdAt: new Date(),
      memberCount: 1,
    },
    {
      id: "team-b",
      name: "Team B",
      organizationId: "org-b",
      createdAt: new Date(),
      memberCount: 1,
    },
  ];
  data.teamMember = [
    {
      id: "team-member-a",
      teamId: "team-a",
      userId: "target",
      role: "member",
      createdAt: new Date(),
      membershipKey: "team-a:target",
    },
    {
      id: "team-member-b",
      teamId: "team-b",
      userId: "target",
      role: "member",
      createdAt: new Date(),
      membershipKey: "team-b:target",
    },
  ];
  async function request(path: string, body?: Record<string, unknown>) {
    return auth.handler(
      new Request(`http://localhost:3000/api/auth${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          authorization: `Bearer ${result.token}`,
          "content-type": "application/json",
        },
        ...(body && { body: JSON.stringify(body) }),
      }),
    );
  }
  return { request, data, db };
}

const mutation = { teamId: "team-a", userId: "target", role: "owner" };

describe("TestOrganizationExtra", () => {
  it.each([
    "get-workspace-detail",
    "list-teams-with-members",
    "list-invitations-with-inviter",
  ])("foreign organization cannot read %s", async (endpoint) => {
    const { request, db } = await setup();
    expect(
      (await request(`/organization-extra/${endpoint}?organizationId=org-b`))
        .status,
    ).toBe(403);
    expect(db.query.team.findMany).not.toHaveBeenCalled();
    expect(db.query.invitation.findMany).not.toHaveBeenCalled();
  });
  it("disabled billing reads workspace role without querying subscriptions", async () => {
    const { request } = await setup("member");
    const response = await request(
      "/organization-extra/get-workspace-detail?organizationId=org-a",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: "org-a",
      role: "member",
      plan: "free",
    });
  });
  it("enabled billing propagates missing subscription storage instead of free plan", async () => {
    const { request } = await setup("owner", true);
    expect(
      (
        await request(
          "/organization-extra/get-workspace-detail?organizationId=org-a",
        )
      ).status,
    ).toBe(500);
  });
  it.each(["member", "guest"])(
    "%s cannot change teamspace roles",
    async (role) => {
      const { request, data } = await setup(role);
      expect(
        (await request("/organization-extra/update-team-member", mutation))
          .status,
      ).toBe(403);
      expect(data.teamMember?.[0]?.role).toBe("member");
    },
  );
  it("organization admins cannot mutate another organization's team", async () => {
    const { request, data } = await setup("admin");
    expect(
      (
        await request("/organization-extra/update-team-member", {
          ...mutation,
          teamId: "team-b",
        })
      ).status,
    ).toBe(403);
    expect(data.teamMember?.[1]?.role).toBe("member");
  });
  it("target must still be an organization member", async () => {
    const { request, data } = await setup();
    data.member = data.member!.filter(
      (member) => member.id !== "target-member",
    );
    expect(
      (await request("/organization-extra/update-team-member", mutation))
        .status,
    ).toBe(403);
    expect(data.teamMember?.[0]?.role).toBe("member");
  });
  it("invalid product role is rejected", async () => {
    const { request } = await setup();
    expect(
      (
        await request("/organization-extra/update-team-member", {
          ...mutation,
          role: "admin",
        })
      ).status,
    ).toBe(400);
  });
  it("authorized role update preserves official membership bookkeeping", async () => {
    const { request, data } = await setup("admin");
    const response = await request(
      "/organization-extra/update-team-member",
      mutation,
    );
    expect(response.status).toBe(200);
    expect(data.teamMember?.[0]).toMatchObject({
      role: "owner",
      membershipKey: "team-a:target",
    });
    expect(data.team?.[0]?.memberCount).toBe(1);
    expect(data.teamMember).toHaveLength(2);
  });
  it("missing team membership is a not found response", async () => {
    const { request, data } = await setup();
    data.teamMember = [];
    expect(
      (await request("/organization-extra/update-team-member", mutation))
        .status,
    ).toBe(404);
    expect(data.teamMember).toEqual([]);
  });
});

describe("TestOrganizationDisplayContract", () => {
  it("team listing preserves custom fields and all members in one batch", async () => {
    const { request, db } = await setup("member");
    db.query.team.findMany.mockResolvedValue([
      {
        id: "team-a",
        name: "Engineering",
        icon: '{"type":"text","src":"E"}',
        description: "Engineering team",
        permission: "closed",
        ownedBy: "owner",
        createdAt: new Date("2026-01-01"),
        updatedAt: null,
        teamMembers: [
          { userId: "target", role: "owner" },
          { userId: "other", role: "member" },
        ],
      },
    ]);
    const response = await request(
      "/organization-extra/list-teams-with-members?organizationId=org-a",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      {
        id: "team-a",
        name: "Engineering",
        icon: '{"type":"text","src":"E"}',
        description: "Engineering team",
        permission: "closed",
        ownedBy: "owner",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: null,
        members: [
          { userId: "target", role: "owner" },
          { userId: "other", role: "member" },
        ],
      },
    ]);
    expect(db.query.team.findMany).toHaveBeenCalledTimes(1);
  });
  it("inviter display survives inviter leaving organization membership", async () => {
    const { request, db } = await setup("member");
    db.query.invitation.findMany.mockResolvedValue([
      {
        id: "invite",
        email: "invitee@example.test",
        role: "member",
        status: "canceled",
        user: {
          id: "former-member",
          name: "Former member",
          email: "former@example.test",
          image: null,
        },
      },
    ]);
    const response = await request(
      "/organization-extra/list-invitations-with-inviter?organizationId=org-a",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      {
        id: "invite",
        email: "invitee@example.test",
        role: "member",
        status: "canceled",
        inviter: {
          id: "former-member",
          name: "Former member",
          email: "former@example.test",
          avatarUrl: "",
        },
      },
    ]);
    expect(db.query.invitation.findMany).toHaveBeenCalledTimes(1);
  });
  it("official membership creation applies the protected role default and count", async () => {
    const { request, data } = await setup();
    data.teamMember = [];
    data.team![0]!.memberCount = 0;
    const response = await request("/organization/add-team-member", {
      organizationId: "org-a",
      teamId: "team-a",
      userId: "target",
      role: "owner",
    });
    expect(response.status).toBe(200);
    expect(data.teamMember).toHaveLength(1);
    expect(data.teamMember[0]).toMatchObject({
      teamId: "team-a",
      userId: "target",
      role: "member",
    });
    expect(data.team?.[0]?.memberCount).toBe(1);
  });
});
