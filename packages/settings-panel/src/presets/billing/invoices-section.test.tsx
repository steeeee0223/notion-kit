import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { toast } from "@notion-kit/ui/primitives";

import { SettingsProvider } from "@/core/settings-provider";
import type { BillingAdapter } from "@/lib/types";

import { InvoicesSection } from "./invoices-section";

afterEach(() => vi.restoreAllMocks());

describe("TestInvoicesSection", () => {
  it("a rejected invoice request displays the failure instead of escaping the click handler", async () => {
    const notify = vi.spyOn(toast, "error");
    const billing: BillingAdapter = {
      getAll: () => Promise.resolve({}),
      upgrade: () => Promise.resolve(),
      changePlan: () => Promise.resolve(),
      editMethod: () => Promise.resolve(),
      editBilledTo: () => Promise.resolve(),
      editEmail: () => Promise.resolve(),
      viewInvoice: () =>
        Promise.reject(new Error("Billing portal unavailable")),
    };
    render(
      <SettingsProvider adapters={{ billing }}>
        <InvoicesSection />
      </SettingsProvider>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "View invoice" }),
    );
    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith("View invoice failed", {
        description: "Billing portal unavailable",
      }),
    );
  });

  it("missing invoice capability disables the invoice action", async () => {
    render(
      <SettingsProvider adapters={{}}>
        <InvoicesSection />
      </SettingsProvider>,
    );
    expect(
      (
        await screen.findByRole("button", { name: "View invoice" })
      ).hasAttribute("disabled"),
    ).toBe(true);
  });
});
