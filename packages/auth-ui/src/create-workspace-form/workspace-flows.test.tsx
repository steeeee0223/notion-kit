import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { useAcceptInvitationForm } from "../accept-invitation-form/use-accept-invitation-form";
import { useCreateWorkspaceForm } from "./use-create-workspace-form";

const api = vi.hoisted(() => ({
  checkSlug: vi.fn(),
  create: vi.fn(),
  setActive: vi.fn(),
  getInvitation: vi.fn(),
  acceptInvitation: vi.fn(),
  reportError: vi.fn(),
}));
vi.mock("../auth-provider", () => ({
  useAuth: () => ({ auth: { organization: api } }),
}));
vi.mock("../lib", async (importOriginal) => {
  const original = await importOriginal<typeof import("../lib")>();
  return { ...original, handleError: api.reportError };
});
beforeEach(() => vi.resetAllMocks());

it("reports a slug uniqueness race without claiming creation succeeded", async () => {
  api.checkSlug.mockResolvedValue({ data: { status: true }, error: null });
  api.create.mockResolvedValue({
    data: null,
    error: { message: "Slug already taken" },
  });
  const onSuccess = vi.fn();
  const { result } = renderHook(() => useCreateWorkspaceForm({ onSuccess }));
  act(() => result.current.form.setValue("name", "Notes"));
  await act(() => result.current.submit());
  expect(api.reportError).toHaveBeenCalledWith(
    { data: null, error: { message: "Slug already taken" } },
    "Create workspace error",
  );
  expect(api.setActive).not.toHaveBeenCalled();
  expect(onSuccess).not.toHaveBeenCalled();
});

it("reports activation failure after accepting an invitation", async () => {
  api.getInvitation.mockResolvedValue({
    data: {
      organizationId: "org-1",
      organizationName: "Notes",
      organizationSlug: "notes",
    },
    error: null,
  });
  api.acceptInvitation.mockResolvedValue({
    data: { invitation: { organizationId: "org-1" } },
    error: null,
  });
  api.setActive.mockResolvedValue({
    data: null,
    error: { message: "Session expired" },
  });
  const onAccept = vi.fn();
  const { result } = renderHook(() =>
    useAcceptInvitationForm({ invitationId: "invite-1", onAccept }),
  );
  await waitFor(() => expect(result.current.workspace.id).toBe("org-1"));
  await act(() => result.current.submit());
  expect(api.setActive).toHaveBeenCalledWith({ organizationId: "org-1" });
  expect(api.reportError).toHaveBeenCalledWith(
    { data: null, error: { message: "Session expired" } },
    "Activate workspace failed",
  );
  expect(onAccept).not.toHaveBeenCalled();
});
