import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { ResetPasswordForm } from "./reset-password-form";

const resetPassword = vi.hoisted(() => vi.fn());
vi.mock("../auth-provider", () => ({
  useAuth: () => ({ auth: { resetPassword } }),
}));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

it("refuses a missing reset token", () => {
  render(<ResetPasswordForm />);
  expect(screen.getByRole("alert").textContent).toContain("invalid");
  expect(screen.queryByRole("button", { name: "Reset password" })).toBeNull();
});

it.each([
  [null, "Your password has been reset."],
  [{ message: "Token expired" }, "Token expired"],
])(
  "shows the official reset result without masking failure",
  async (error, message) => {
    resetPassword.mockResolvedValue({
      data: error ? null : { status: true },
      error,
    });
    const user = userEvent.setup();
    render(<ResetPasswordForm token="reset-token" />);
    await user.type(
      screen.getByLabelText("New password", { exact: true }),
      "new-password",
    );
    await user.type(
      screen.getByLabelText("Confirm password", { exact: true }),
      "new-password",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));
    expect(await screen.findByText(message)).toBeTruthy();
    expect(resetPassword).toHaveBeenCalledWith({
      token: "reset-token",
      newPassword: "new-password",
    });
  },
);
