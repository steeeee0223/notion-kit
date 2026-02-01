import { render, screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";
import { expect } from "vitest";

import { TableView } from "../table-contexts";
import { mockData, mockProperties } from "./mock";

export async function openSettingsMenu(user: UserEvent) {
  render(<TableView properties={mockProperties} data={mockData} />);

  const settingsButton = screen.getByRole("button", { name: /settings/i });
  await user.click(settingsButton);

  const menu = screen.getByRole("menu", { name: "View Settings" });
  expect(menu).toBeInTheDocument();
  return menu;
}
