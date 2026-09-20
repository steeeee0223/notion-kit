import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { TwoFactorForm } from "./two-factor-form";

const api = vi.hoisted(() => ({
  verifyTotp: vi.fn(),
  verifyBackupCode: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("../auth-provider", () => ({
  useAuth: () => ({ auth: { twoFactor: api }, redirect: api.redirect }),
}));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

it("retains a failed challenge and only redirects after successful verification", async () => {
  api.verifyTotp
    .mockResolvedValueOnce({ data: null, error: { message: "Invalid code" } })
    .mockResolvedValueOnce({ data: { token: "session" }, error: null });
  const user = userEvent.setup();
  render(<TwoFactorForm methods={["totp"]} callbackURL="/home" />);
  await user.type(screen.getByLabelText("Authenticator code"), "123456");
  await user.click(screen.getByRole("button", { name: "Verify" }));
  expect(await screen.findByText("Invalid code")).toBeTruthy();
  expect(api.redirect).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Verify" }));
  expect(api.verifyTotp).toHaveBeenCalledWith({ code: "123456" });
  expect(api.redirect).toHaveBeenCalledWith("/home");
});

it("allows a backup code using the official verification endpoint", async () => {
  api.verifyBackupCode.mockResolvedValue({
    data: { token: "session" },
    error: null,
  });
  const user = userEvent.setup();
  render(<TwoFactorForm methods={["totp"]} />);
  await user.click(screen.getByRole("button", { name: "Use a backup code" }));
  await user.type(screen.getByLabelText("Backup code"), "backup-code");
  await user.click(screen.getByRole("button", { name: "Verify" }));
  expect(api.verifyBackupCode).toHaveBeenCalledWith({ code: "backup-code" });
  expect(api.redirect).toHaveBeenCalledWith("/");
});
