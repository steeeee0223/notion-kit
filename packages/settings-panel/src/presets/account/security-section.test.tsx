import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsProvider } from "@/core/settings-provider";

import { SecuritySection } from "./security-section";

describe("TestSecuritySection", () => {
  it("unavailable password and passkey capabilities cannot be opened", async () => {
    render(
      <SettingsProvider adapters={{}}>
        <SecuritySection />
      </SettingsProvider>,
    );
    expect(
      (await screen.findByRole("switch")).getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: /passkey/i }).hasAttribute("disabled"),
    ).toBe(true);
  });
});
