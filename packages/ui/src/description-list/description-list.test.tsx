import { render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DescriptionList, DescriptionItem, type DescriptionListProps } from "./description-list";

class DescriptionListObject {
  private constructor(readonly user: UserEvent) {}

  static render(props: DescriptionListProps) {
    const user = userEvent.setup();
    render(<DescriptionList {...props} />);
    return new DescriptionListObject(user);
  }

  row(label: string) {
    return screen.getByText(label).closest<HTMLElement>("[data-slot=description-item]")!;
  }

  copyButton(label: string) {
    return within(this.row(label)).getByRole("button", { name: "Copy value" });
  }

  async copy(label: string) {
    await this.user.click(this.copyButton(label));
  }
}

describe("DescriptionList", () => {
  it("DescriptionItem_Render_ShowsLabelAndValue", () => {
    DescriptionListObject.render({
      children: <DescriptionItem label="Status" value="Active" />,
    });

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("DescriptionItem_WithoutCopyValue_HidesCopyButton", () => {
    DescriptionListObject.render({
      children: <DescriptionItem label="Status" value="Active" />,
    });

    expect(screen.queryByRole("button", { name: "Copy value" })).not.toBeInTheDocument();
  });

  it("DescriptionItem_Copy_WritesValueToClipboardAndShowsCopiedTooltip", async () => {
    const page = DescriptionListObject.render({
      children: <DescriptionItem label="API key" value="sk_live_123" copyValue="sk_live_123" />,
    });
    // `userEvent.setup()` installs its own clipboard stub, so the spy must
    // be attached after `render` calls it.
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    await page.copy("API key");

    expect(writeText).toHaveBeenCalledWith("sk_live_123");
  });

  it("DescriptionList_Layout_DefaultsToHorizontal", () => {
    render(<DescriptionList data-testid="list" />);

    expect(screen.getByTestId("list")).toHaveAttribute("data-layout", "horizontal");
  });
});
