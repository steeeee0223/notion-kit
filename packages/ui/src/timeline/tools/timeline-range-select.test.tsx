import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { TimelineRangeSelect } from "./timeline-range-select";

it("TimelineRangeSelect_SelectedRange_ShowsSelectItemIndicator", async () => {
  const user = userEvent.setup();
  render(<TimelineRangeSelect value="monthly" onChange={() => {}} />);

  await user.click(screen.getByRole("combobox"));

  const selectedRange = await screen.findByRole("option", {
    name: "Month",
    selected: true,
  });

  expect(
    within(selectedRange).getByRole("graphics-symbol", { hidden: true }),
  ).toBeVisible();
});
