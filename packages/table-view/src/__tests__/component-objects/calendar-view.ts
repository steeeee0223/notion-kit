import { fireEvent, screen, within } from "@testing-library/react";

export class CalendarViewObject {
  root() {
    return screen.getByRole("region", { name: "Calendar" });
  }
  event(name: string) {
    return within(this.root()).getByRole("button", { name });
  }
  eventNames(name: RegExp) {
    return within(this.root())
      .getAllByRole("button", { name })
      .map((event) => event.getAttribute("aria-label"));
  }
  queryEvent(name: string) {
    return within(this.root()).queryByRole("button", { name });
  }
  async findReady() {
    return screen.findByRole("region", { name: "Calendar" });
  }
  create(date: string) {
    fireEvent.click(
      within(this.root()).getByRole("button", {
        name: `Create event on ${date}`,
      }),
    );
  }
  open(name: string) {
    fireEvent.click(this.event(name));
  }
  rightClickTitle(name: string) {
    fireEvent.contextMenu(within(this.event(name)).getByText(name), {
      clientX: 40,
      clientY: 20,
    });
  }
  next() {
    fireEvent.click(within(this.root()).getByRole("button", { name: "Next" }));
  }
  range() {
    return within(this.root()).getByRole("combobox", {
      name: "Calendar range",
    });
  }
}
