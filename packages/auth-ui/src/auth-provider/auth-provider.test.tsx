import { renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "./auth-provider";

vi.mock("@notion-kit/auth/client", () => ({ createAuthClient: () => ({}) }));

it("resolves relative reset and billing configuration against the consumer app", () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <AuthProvider
        appURL="https://notes.example.com"
        authURL="https://auth.example.com"
        resetPasswordURL="/reset-password"
        billingReturnURL="/settings/billing"
      >
        {children}
      </AuthProvider>
    ),
  });
  expect(result.current.resetPasswordURL).toBe(
    "https://notes.example.com/reset-password",
  );
  expect(result.current.billingReturnURL).toBe(
    "https://notes.example.com/settings/billing",
  );
});
