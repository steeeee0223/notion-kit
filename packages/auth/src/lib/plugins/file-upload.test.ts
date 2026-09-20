import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { bearer, organization } from "better-auth/plugins";
import { describe, expect, it, vi } from "vitest";

import { fileUpload } from "./file-upload";

async function setup() {
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
    upload: vi.fn((_bucket: string, path: string) =>
      Promise.resolve(`https://storage.test/files/${path}`),
    ),
    remove: vi.fn(() => Promise.resolve()),
  };
  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "file-upload-purpose-test-secret-at-least-32",
    database: memoryAdapter(data),
    emailAndPassword: { enabled: true },
    plugins: [bearer(), organization(), fileUpload({ storage })],
  });
  const account = await auth.api.signUpEmail({
    body: {
      email: "avatar@example.test",
      password: "password12345",
      name: "Avatar",
    },
  });
  const upload = (body: Record<string, unknown>) =>
    auth.handler(
      new Request("http://localhost:3000/api/auth/file-upload/upload", {
        method: "POST",
        headers: {
          authorization: `Bearer ${account.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: "aGVsbG8=",
          contentType: "image/png",
          ...body,
        }),
      }),
    );
  return { upload, storage, userId: account.user.id };
}

describe("TestFileUploadPurpose", () => {
  it("a user without an organization can upload an avatar only under their own identity", async () => {
    const { upload, storage, userId } = await setup();
    const response = await upload({
      purpose: "avatar",
      userId: "victim",
      organizationId: "foreign-org",
    });
    expect(response.status).toBe(200);
    expect(storage.upload).toHaveBeenCalledWith(
      "files",
      expect.stringMatching(new RegExp(`^${userId}/avatar/[^/]+\\.png$`)),
      Buffer.from("hello"),
      "image/png",
    );
  });
  it("avatar access does not permit uploading a workspace icon for another organization", async () => {
    const { upload, storage } = await setup();
    const response = await upload({
      purpose: "workspace-icon",
      organizationId: "foreign-org",
    });
    expect(response.status).toBe(403);
    expect(storage.upload).not.toHaveBeenCalled();
  });
  it("workspace icon uploads still require an organization", async () => {
    const { upload, storage } = await setup();
    expect((await upload({ purpose: "workspace-icon" })).status).toBe(400);
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
