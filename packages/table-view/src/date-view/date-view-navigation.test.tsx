import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { TableViewWrapper } from "@/table-contexts";

import { useDateViewNavigation } from "./date-view-navigation-provider";

function NavigationProbe({ name }: { name: string }) {
  const { anchorDate, setAnchorDate } = useDateViewNavigation();
  return (
    <>
      <button onClick={() => setAnchorDate(1797379200000)}>
        Navigate {name}
      </button>
      <output aria-label={name}>{anchorDate}</output>
    </>
  );
}

it("DateViewNavigation_SeparateTableInstances_DoNotShareAnchor", () => {
  render(
    <>
      <TableViewWrapper>
        <NavigationProbe name="first" />
      </TableViewWrapper>
      <TableViewWrapper>
        <NavigationProbe name="second" />
      </TableViewWrapper>
    </>,
  );
  const original = screen.getByLabelText("second").textContent;
  fireEvent.click(screen.getByRole("button", { name: "Navigate first" }));
  expect(screen.getByLabelText("second")).toHaveTextContent(original);
  expect(screen.getByLabelText("first")).toHaveTextContent("1797379200000");
});
