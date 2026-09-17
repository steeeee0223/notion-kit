import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm, useWatch } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { I18nProvider } from "@notion-kit/i18n";
import { Role } from "@notion-kit/schemas";
import { Form } from "@notion-kit/ui/primitives";

import { EmailsField } from "./emails";
import type { AddMembersSchema } from "./types";

function EmailForm() {
  const form = useForm<AddMembersSchema>({
    defaultValues: { _emailInput: "", emails: [], role: Role.MEMBER },
  });
  const emails = useWatch({ control: form.control, name: "emails" });
  return (
    <Form {...form}>
      <EmailsField invitedMembers={[]} />
      <output aria-label="Selected emails">{JSON.stringify(emails)}</output>
    </Form>
  );
}

describe("EmailsField", () => {
  it("stores a new email address and removes it through its chip", async () => {
    render(
      <I18nProvider language="en">
        <EmailForm />
      </I18nProvider>,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    fireEvent.click(
      await screen.findByRole("option", { name: "ada@example.com" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("status", { name: "Selected emails" }).textContent,
      ).toBe('["ada@example.com"]');
    });
    fireEvent.click(await screen.findByRole("button", { name: "Remove" }));
    await waitFor(() => {
      expect(
        screen.getByRole("status", { name: "Selected emails" }).textContent,
      ).toBe("[]");
    });
  });
});
