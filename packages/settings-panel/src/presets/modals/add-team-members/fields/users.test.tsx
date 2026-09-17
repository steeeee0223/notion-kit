import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm, useWatch } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { I18nProvider } from "@notion-kit/i18n";
import { Form } from "@notion-kit/ui/primitives";

import type { WorkspaceMember } from "./types";
import type { TeamMembersFormSchema } from "./use-add-team-members-form";
import { UsersField } from "./users";

const members: WorkspaceMember[] = [
  { id: "user-1", name: "Alex", email: "alex1@example.com", avatarUrl: "" },
  { id: "user-2", name: "Alex", email: "alex2@example.com", avatarUrl: "" },
];

function MembersForm() {
  const form = useForm<TeamMembersFormSchema>({
    defaultValues: { users: [members[0]!], role: "member" },
  });
  const users = useWatch({ control: form.control, name: "users" });
  return (
    <Form {...form}>
      <UsersField workspaceMembers={members} />
      <output aria-label="Selected member IDs">
        {JSON.stringify(users.map((user) => user.id))}
      </output>
    </Form>
  );
}

describe("UsersField", () => {
  it("selects members with the same name independently by ID", async () => {
    render(
      <I18nProvider language="en">
        <MembersForm />
      </I18nProvider>,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Alex" },
    });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    fireEvent.click(
      await screen.findByRole("option", { name: "Alex", selected: false }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("status", { name: "Selected member IDs" }).textContent,
      ).toBe('["user-1","user-2"]');
    });
  });
});
