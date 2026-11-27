import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import { AuthProvider } from "../auth-provider";
import {
  WorkspaceSwitcher,
  type WorkspaceSwitcherProps,
} from "./workspace-switcher";

const authURL = "https://auth.example.test";
const notes = { id: "org-notes", name: "Notes", slug: "notes", logo: null };
const tasks = { id: "org-tasks", name: "Tasks", slug: "tasks", logo: null };

function renderSwitcher(props: WorkspaceSwitcherProps) {
  const sent: Request[] = [];
  const user = { id: "user-1", email: "ada@example.test" };
  let active = notes;
  let signedIn = true;
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const request = new Request(input, init);
    if (request.method === "POST") sent.push(request);

    switch (new URL(request.url).pathname) {
      case "/api/auth/get-session":
        return Promise.resolve(
          Response.json(
            signedIn
              ? { user, session: { activeOrganizationId: active.id } }
              : null,
          ),
        );
      case "/api/auth/organization/list":
        return Promise.resolve(Response.json([notes, tasks]));
      case "/api/auth/organization/get-full-organization":
        return Promise.resolve(Response.json(signedIn ? active : null));
      case "/api/auth/organization/list-members":
        return Promise.resolve(
          Response.json({
            total: 1,
            members: [{ userId: user.id, role: "member" }],
          }),
        );
      case "/api/auth/organization/set-active":
        active = { ...tasks, slug: "tasks-current" };
        return Promise.resolve(Response.json(active));
      case "/api/auth/sign-out":
        signedIn = false;
        return Promise.resolve(Response.json({ success: true }));
      default:
        throw new Error(`Unexpected auth request: ${request.url}`);
    }
  });

  const { container } = render(
    <AuthProvider authURL={authURL}>
      <WorkspaceSwitcher {...props} />
    </AuthProvider>,
  );
  return { sent, switcher: within(container) };
}

afterEach(() => vi.restoreAllMocks());

it("WorkspaceSwitcher_SelectingWorkspace_NavigatesToTheOrganizationReturnedByAuth", async () => {
  const onWorkspaceChange = vi.fn();
  const { sent, switcher } = renderSwitcher({ onWorkspaceChange });
  const user = userEvent.setup();
  await user.click(await switcher.findByRole("button", { name: /Notes$/ }));
  const menu = await screen.findByRole("menu");

  await user.click(
    await within(menu).findByRole("menuitemcheckbox", { name: /Tasks$/ }),
  );

  await waitFor(() =>
    expect(onWorkspaceChange).toHaveBeenCalledExactlyOnceWith({
      id: tasks.id,
      slug: "tasks-current",
    }),
  );
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({
    method: "POST",
    url: `${authURL}/api/auth/organization/set-active`,
  });
  expect(await sent[0]?.json()).toEqual({ organizationId: tasks.id });
  await switcher.findByRole("button", { name: /Tasks$/ });
});

it("WorkspaceSwitcher_LoggingOut_SignsOutAndNotifiesTheApp", async () => {
  const onSignedOut = vi.fn();
  const { sent, switcher } = renderSwitcher({ onSignedOut });
  const user = userEvent.setup();
  await user.click(await switcher.findByRole("button", { name: /Notes$/ }));
  const menu = await screen.findByRole("menu");

  await user.click(within(menu).getByRole("menuitem", { name: "Log out" }));

  await waitFor(() => expect(onSignedOut).toHaveBeenCalledOnce());
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({
    method: "POST",
    url: `${authURL}/api/auth/sign-out`,
  });
  await waitFor(() => {
    expect(switcher.queryByRole("button", { name: /Notes$/ })).toBeNull();
  });
});
