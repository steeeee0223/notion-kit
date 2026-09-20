import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { bearer, organization } from "better-auth/plugins";
import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import type { DB } from "../../db/db";
import { roles } from "../permissions";
import { emoji } from "./emoji";
import { fileUpload } from "./file-upload";
import { stripeExtra } from "./stripe-extra";

async function setup(role = "owner") {
  const data: Record<string, Record<string, unknown>[]> = {
    user: [],
    session: [],
    account: [],
    verification: [],
    organization: [],
    member: [],
    invitation: [],
  };
  const storage = {
    upload: vi
      .fn()
      .mockResolvedValue("https://storage.test/emojis/org-a/image.png"),
    remove: vi.fn().mockResolvedValue(undefined),
    getPublicUrl: vi.fn(),
  };
  const db = {
    query: {
      emoji: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({
          id: "image",
          organizationId: "org-b",
          imageUrl: "https://storage.test/emojis/org-b/image.png",
        }),
      },
    },
    insert: vi
      .fn()
      .mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    delete: vi
      .fn()
      .mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    update: vi.fn().mockReturnValue({
      set: vi
        .fn()
        .mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    }),
  };
  const customers = {
    retrieve: vi.fn().mockResolvedValue({
      email: "billing@example.test",
      name: "Billing",
      address: null,
      invoice_settings: { default_payment_method: null },
    }),
    update: vi.fn().mockResolvedValue({}),
  };
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "resource-authorization-test-secret-at-least-32",
    database: memoryAdapter(data),
    emailAndPassword: { enabled: true },
    plugins: [
      bearer(),
      organization({
        roles,
        schema: {
          organization: {
            additionalFields: {
              stripeCustomerId: { type: "string", input: false },
            },
          },
        },
      }),
      fileUpload({ storage }),
      emoji({ db: db as unknown as DB, storage }),
      stripeExtra({ stripeClient: { customers } as unknown as Stripe }),
    ],
  });
  const result = await auth.api.signUpEmail({
    body: {
      email: "member@example.test",
      password: "password12345",
      name: "Member",
    },
  });
  data.organization = ["org-a", "org-b"].map((id) => ({
    id,
    name: id,
    slug: id,
    createdAt: new Date(),
    stripeCustomerId: `cus-${id}`,
  }));
  data.member = [
    {
      id: "membership",
      organizationId: "org-a",
      userId: result.user.id,
      role,
      createdAt: new Date(),
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
  return { request, storage, db, customers };
}

const upload = {
  organizationId: "org-a",
  purpose: "workspace-icon",
  imageBase64: "aGVsbG8=",
  contentType: "image/png",
};

describe("ResourceAuthorization", () => {
  it.each([
    "/emoji/list?organizationId=org-b",
    "/stripe-extra/get-customer?organizationId=org-b",
  ])("foreign organization read is forbidden: %s", async (path) => {
    const { request } = await setup();
    expect((await request(path)).status).toBe(403);
  });
  it.each(["/emoji/delete", "/emoji/update"])(
    "foreign emoji mutation is forbidden: %s",
    async (path) => {
      const { request, storage } = await setup();
      expect(
        (await request(path, { id: "image", name: "renamed" })).status,
      ).toBe(403);
      expect(storage.remove).not.toHaveBeenCalled();
      expect(storage.upload).not.toHaveBeenCalled();
    },
  );
  it.each(["member", "guest"])(
    "%s cannot upload workspace icons or edit billing",
    async (role) => {
      const { request } = await setup(role);
      expect((await request("/file-upload/upload", upload)).status).toBe(403);
      expect(
        (
          await request("/stripe-extra/update-customer", {
            organizationId: "org-a",
            name: "Changed",
          })
        ).status,
      ).toBe(403);
    },
  );
  it.each([
    { contentType: "text/html" },
    { purpose: "../../escape" },
    { imageBase64: "not base64!" },
    { imageBase64: "" },
    { imageBase64: Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64") },
    { organizationId: "../escape" },
  ])("invalid upload is rejected before storage, case %#", async (invalid) => {
    const { request, storage } = await setup();
    expect(
      (await request("/file-upload/upload", { ...upload, ...invalid })).status,
    ).toBe(400);
    expect(storage.upload).not.toHaveBeenCalled();
  });
  it("foreign organization uploads are forbidden before storage", async () => {
    const { request, storage } = await setup();
    expect(
      (
        await request("/file-upload/upload", {
          ...upload,
          organizationId: "org-b",
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await request("/emoji/add", {
          ...upload,
          organizationId: "org-b",
          name: "smile",
        })
      ).status,
    ).toBe(403);
    expect(storage.upload).not.toHaveBeenCalled();
  });
  it.each(["member", "guest"])(
    "%s cannot add organization emojis",
    async (role) => {
      const { request, storage } = await setup(role);
      expect(
        (await request("/emoji/add", { ...upload, name: "smile" })).status,
      ).toBe(403);
      expect(storage.upload).not.toHaveBeenCalled();
    },
  );
  it.each(["owner", "admin", "member,admin"])(
    "%s may upload a workspace icon",
    async (role) => {
      const { request, storage } = await setup(role);
      expect((await request("/file-upload/upload", upload)).status).toBe(200);
      expect(storage.upload).toHaveBeenCalledWith(
        "files",
        expect.stringMatching(/^org-a\/workspace-icon\/.+\.png$/),
        Buffer.from("hello"),
        "image/png",
      );
    },
  );
  it.each(["owner", "admin", "member,admin"])(
    "%s can read and update their organization billing",
    async (role) => {
      const { request, customers } = await setup(role);
      const response = await request(
        "/stripe-extra/get-customer?organizationId=org-a",
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        email: "billing@example.test",
      });
      expect(
        (
          await request("/stripe-extra/update-customer", {
            organizationId: "org-a",
            name: "Changed",
          })
        ).status,
      ).toBe(200);
      expect(customers.update).toHaveBeenCalledWith("cus-org-a", {
        name: "Changed",
      });
    },
  );
  it("Stripe failure is not converted into an empty customer", async () => {
    const { request, customers } = await setup();
    customers.retrieve.mockRejectedValue(new Error("Stripe unavailable"));
    expect(
      (await request("/stripe-extra/get-customer?organizationId=org-a")).status,
    ).toBe(500);
  });
  it("members can read their own organization emojis", async () => {
    const { request } = await setup("member");
    expect((await request("/emoji/list?organizationId=org-a")).status).toBe(
      200,
    );
  });
  it.each([
    { name: "" },
    { name: "x".repeat(65) },
    { imageBase64: "bad" },
    { contentType: "image/svg+xml" },
  ])("invalid emoji upload is rejected, case %#", async (invalid) => {
    const { request, storage } = await setup();
    expect(
      (await request("/emoji/add", { ...upload, name: "smile", ...invalid }))
        .status,
    ).toBe(400);
    expect(storage.upload).not.toHaveBeenCalled();
  });
  it("emoji image updates require MIME and bytes together", async () => {
    const { request } = await setup();
    expect(
      (await request("/emoji/update", { id: "image", imageBase64: "aGVsbG8=" }))
        .status,
    ).toBe(400);
  });
  it("authorized emoji deletion reports storage errors and preserves the row", async () => {
    const { request, storage, db } = await setup();
    db.query.emoji.findFirst.mockResolvedValue({
      id: "image",
      organizationId: "org-a",
      imageUrl: "https://storage.test/emojis/org-a/image.png",
    });
    storage.remove.mockRejectedValue(new Error("Storage unavailable"));
    expect((await request("/emoji/delete", { id: "image" })).status).toBe(500);
    expect(db.delete).not.toHaveBeenCalled();
  });
  it("emoji deletion cannot remove an unrelated storage path", async () => {
    const { request, storage, db } = await setup();
    db.query.emoji.findFirst.mockResolvedValue({
      id: "image",
      organizationId: "org-a",
      imageUrl: "https://storage.test/emojis/org-b/victim.png",
    });
    expect((await request("/emoji/delete", { id: "image" })).status).toBe(400);
    expect(storage.remove).not.toHaveBeenCalled();
  });
  it("storage failure is not reported as upload success", async () => {
    const { request, storage } = await setup();
    storage.upload.mockRejectedValue(new Error("storage unavailable"));
    expect((await request("/file-upload/upload", upload)).status).toBe(500);
  });
});
