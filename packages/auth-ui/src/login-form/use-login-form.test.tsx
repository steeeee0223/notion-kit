import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLoginForm } from "./use-login-form";

const api = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  toast: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("../auth-provider", () => ({
  useAuth: () => ({
    appURL: "https://notes.example.com",
    resetPasswordURL: "https://notes.example.com/reset-password",
    redirect: api.redirect,
    auth: {
      requestPasswordReset: api.requestPasswordReset,
      signIn: { email: api.signIn },
      signUp: { email: api.signUp },
    },
  }),
}));
vi.mock("@notion-kit/ui/primitives", () => ({ toast: api.toast }));
beforeEach(() => vi.resetAllMocks());

describe("LoginForm", () => {
  it("requests the reset email with this app's token consumption URL", async () => {
    api.requestPasswordReset.mockResolvedValue({
      data: { status: true },
      error: null,
    });
    const { result } = renderHook(() => useLoginForm({ mode: "sign_in" }));
    act(() => {
      result.current.handlePasswordForgot();
      result.current.form.setValue("email", "ada@example.com");
    });
    await act(() => result.current.submit());
    expect(api.requestPasswordReset).toHaveBeenCalledWith({
      email: "ada@example.com",
      redirectTo: "https://notes.example.com/reset-password",
    });
    expect(result.current.forgotPasswordStage).toBe("link_sent");
  });

  it("keeps the email form open when requesting a reset fails", async () => {
    api.requestPasswordReset.mockResolvedValue({
      data: null,
      error: { message: "Try again later" },
    });
    const { result } = renderHook(() => useLoginForm({ mode: "sign_in" }));
    act(() => {
      result.current.handlePasswordForgot();
      result.current.form.setValue("email", "ada@example.com");
    });
    await act(() => result.current.submit());
    expect(result.current.forgotPasswordStage).toBe("email");
    expect(result.current.errorMessage).toBe("Try again later");
  });

  it("requires the second factor without claiming sign-in success", async () => {
    api.signIn.mockResolvedValue({
      data: { twoFactorRedirect: true, twoFactorMethods: ["totp"] },
      error: null,
    });
    const { result } = renderHook(() => useLoginForm({ mode: "sign_in" }));
    act(() => {
      result.current.form.setValue("email", "ada@example.com");
      result.current.form.setValue("password", "secret-password");
    });
    await act(() => result.current.submit());
    expect(result.current.twoFactorMethods).toEqual(["totp"]);
    expect(api.signIn).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret-password",
      callbackURL: "https://notes.example.com/",
    });
    expect(api.toast).not.toHaveBeenCalled();
    expect(api.redirect).not.toHaveBeenCalled();
  });
});

it("sends signup callbacks to the app origin", async () => {
  api.signUp.mockResolvedValue({
    data: { user: { id: "new-user" } },
    error: null,
  });
  const { result } = renderHook(() =>
    useLoginForm({ mode: "sign_up", callbackURL: "/welcome" }),
  );
  act(() => {
    result.current.form.setValue("email", "ada@example.com");
    result.current.form.setValue("password", "secret-password");
  });
  await act(() => result.current.submit());
  expect(api.signUp).toHaveBeenCalledWith({
    name: "ada",
    email: "ada@example.com",
    password: "secret-password",
    preferredName: "ada",
    callbackURL: "https://notes.example.com/welcome",
  });
});
