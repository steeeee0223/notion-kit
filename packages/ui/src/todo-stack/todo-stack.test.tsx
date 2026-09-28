import { render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TodoItem, TodoStack, type TodoStackProps } from "./todo-stack";

class TodoStackObject {
  private constructor(readonly user: UserEvent) {}

  static render(props: TodoStackProps) {
    const user = userEvent.setup();
    render(<TodoStack {...props} />);
    return new TodoStackObject(user);
  }

  item(name: string) {
    return screen
      .getByText(name)
      .closest<HTMLElement>("[data-slot=todo-item]")!;
  }

  dismissButton(name: string) {
    return within(this.item(name)).getByRole("button", { name: "Dismiss" });
  }

  async dismiss(name: string) {
    await this.user.click(this.dismissButton(name));
  }
}

describe("TodoStack", () => {
  it("TodoStack_NoItems_ShowsAllDoneEmptyState", () => {
    TodoStackObject.render({ title: "To-dos" });

    expect(screen.getByText("All done")).toBeInTheDocument();
  });

  it("TodoStack_WithItems_HidesEmptyState", () => {
    TodoStackObject.render({
      title: "To-dos",
      children: <TodoItem title="Review invoice" />,
    });

    expect(screen.queryByText("All done")).not.toBeInTheDocument();
    expect(screen.getByText("Review invoice")).toBeInTheDocument();
  });

  it("TodoStack_Count_RendersNextToTitle", () => {
    TodoStackObject.render({
      title: "To-dos",
      count: 3,
      children: <TodoItem title="Review invoice" />,
    });

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("TodoItem_Dismissible_CallsOnDismiss", async () => {
    const onDismiss = vi.fn();
    const page = TodoStackObject.render({
      children: (
        <TodoItem title="Review invoice" dismissible onDismiss={onDismiss} />
      ),
    });

    await page.dismiss("Review invoice");

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("TodoItem_Count_RendersABadge", () => {
    TodoStackObject.render({
      children: <TodoItem title="Review invoices" count={5} />,
    });

    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
