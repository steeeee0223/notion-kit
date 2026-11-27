import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";

const api = vi.hoisted(() => ({
  passkey: vi.fn(),
  redirect: vi.fn(),
  reportError: vi.fn(),
}));
vi.mock("../auth-provider", () => ({
  useAuth: () => ({
    appURL: "https://notes.example.com",
    auth: { signIn: { passkey: api.passkey } },
    redirect: api.redirect,
  }),
}));
vi.mock("../lib", () => ({ handleError: api.reportError }));

it("handles WebAuthn errors returned before the final login request", async () => {
  api.passkey.mockResolvedValue({
    data: null,
    error: { code: "AUTH_CANCELLED", message: "Authentication cancelled" },
  });
  const user = userEvent.setup();
  render(<LoginForm mode="sign_in" />);
  const button = screen.getByRole("button", { name: "Login with passkey" });
  await user.click(button);
  expect(api.reportError).toHaveBeenCalledWith(
    {
      data: null,
      error: { code: "AUTH_CANCELLED", message: "Authentication cancelled" },
    },
    "Failed to login with passkey",
  );
  expect(api.redirect).not.toHaveBeenCalled();
  expect(button.hasAttribute("disabled")).toBe(false);
});
