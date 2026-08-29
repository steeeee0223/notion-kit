import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

import { RowActionsObject } from "./row-actions";
import { SortMenuObject } from "./sort-menu";
import { TimelineViewObject } from "./timeline-view";
import { ViewSettingsMenuObject } from "./view-settings-menu";

export class TableViewObject {
  constructor(readonly user: UserEvent) {}

  readonly timeline = new TimelineViewObject();

  private nameMatcher(name: string | RegExp) {
    return typeof name === "string"
      ? new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      : name;
  }

  button(name: string | RegExp) {
    return screen.getByRole("button", { name });
  }

  searchInput() {
    return screen.getByRole("textbox", { name: "Search table" });
  }

  row(name: string | RegExp) {
    const matcher = this.nameMatcher(name);
    const row = screen
      .getAllByRole("row")
      .find((row) => matcher.test(row.textContent));
    if (!row) throw new Error(`Unable to find row matching ${matcher}`);
    return row;
  }

  rows(name?: string | RegExp) {
    const rows = screen.getAllByRole("row");
    if (!name) return rows;
    const matcher = this.nameMatcher(name);
    return rows.filter((row) => matcher.test(row.textContent));
  }

  rowOrder(names: readonly string[]) {
    return this.rows().map((row) => {
      const name = names.find((name) =>
        within(row).queryByRole("button", { name }),
      );
      if (!name) throw new Error("Unable to identify row by its title button");
      return name;
    });
  }

  group(name: string) {
    return screen.getByRole("group", { name: `Group ${name}` });
  }

  async expandGroup(name: string) {
    const group = this.group(name);
    await this.user.click(within(group).getByRole("button", { name: "Open" }));
  }

  footerResult(propertyName: string) {
    return screen.getByRole("button", {
      name: `${propertyName} calculation`,
    });
  }

  cellButton(rowName: string | RegExp, cellName: string | RegExp) {
    return within(this.row(rowName)).getByRole("button", { name: cellName });
  }

  async openViewSettings() {
    await this.user.click(this.button("Settings"));
    return ViewSettingsMenuObject.find(this.user);
  }

  async openSortMenu() {
    await this.user.click(this.button("Sort"));
    return SortMenuObject.find(this.user);
  }

  async openRowActions(rowName: string) {
    return RowActionsObject.open(this, rowName);
  }

  filterMenu() {
    return new FilterMenuObject(this.user);
  }

  async clickButton(name: string | RegExp) {
    await this.user.click(this.button(name));
  }

  async clickOutside() {
    await this.user.click(document.body);
  }
}

export class FilterMenuObject {
  constructor(readonly user: UserEvent) {}

  menu() {
    return screen.getByRole("region", { name: "Filters" });
  }

  group(id: string) {
    return screen.getByTestId(`filter-group-${id}`);
  }

  rule(id: string) {
    return screen.getByTestId(`filter-rule-${id}`);
  }

  private select(scope: HTMLElement, name: string) {
    return within(scope).getByRole("combobox", { name });
  }

  property(id: string) {
    return this.select(this.rule(id), "Property select");
  }

  operator(id: string) {
    return this.select(this.rule(id), "Operator select");
  }

  operand(id: string, label = "Value") {
    return within(this.rule(id)).getByRole("textbox", {
      name: label,
    });
  }

  calendarButton(
    id: string,
    name: "Open calendar" | "Open start calendar" | "Open end calendar",
  ) {
    return within(this.rule(id)).getByRole("button", { name });
  }

  selectOperand(id: string) {
    return this.select(this.rule(id), "Value select");
  }

  logic(id: string) {
    return this.ownedControl(this.node(id), "combobox", "Filter logic select");
  }

  async openAddMenu(groupId: string) {
    await this.user.click(this.addRule(groupId));
  }

  async openEmptyAddMenu() {
    await this.user.click(this.emptyAddRule());
  }

  emptyAddRule() {
    return within(this.menu()).getByRole("button", {
      name: "Add filter rule",
    });
  }

  addRule(groupId: string) {
    return this.ownedButton(this.group(groupId), "Add filter rule");
  }

  async deleteFilter() {
    await this.user.click(
      within(this.menu()).getByRole("menuitem", { name: "Delete filter" }),
    );
  }

  async addMenuItem(name: "Add filter rule" | "Add filter group") {
    return screen.findByRole("menuitem", { name }, { timeout: 5_000 });
  }

  async chooseProperty(id: string, name: string) {
    await this.user.click(this.property(id));
    await this.user.click(
      await screen.findByRole("option", { name }, { timeout: 5_000 }),
    );
  }

  async chooseOperator(id: string, name: string) {
    await this.user.click(this.operator(id));
    await this.user.click(
      await screen.findByRole("option", { name }, { timeout: 5_000 }),
    );
  }

  async chooseLogic(id: string, name: "And" | "Or") {
    await this.user.click(this.logic(id));
    await this.user.click(
      await screen.findByRole("option", { name }, { timeout: 5_000 }),
    );
  }

  actions(id: string) {
    return this.ownedButton(this.node(id), "Actions");
  }

  async deleteNode(id: string) {
    await this.user.click(this.actions(id));
    await this.user.click(
      await screen.findByRole("menuitem", { name: "Delete" }),
    );
  }

  private node(id: string) {
    return (
      screen.queryByTestId(`filter-rule-${id}`) ??
      screen.getByTestId(`filter-group-${id}`)
    );
  }

  private ownedButton(owner: HTMLElement, name: string) {
    return this.ownedControl(owner, "button", name);
  }

  private ownedControl(
    owner: HTMLElement,
    role: "button" | "combobox",
    name: string,
  ) {
    const control = within(owner)
      .getAllByRole(role, { name })
      .find((candidate) => this.owner(candidate) === owner);
    if (!control) throw new Error(`Unable to find ${name}`);
    return control;
  }

  private owner(element: HTMLElement) {
    return element.closest<HTMLElement>(
      '[data-testid^="filter-rule-"], [data-testid^="filter-group-"]',
    );
  }
}
