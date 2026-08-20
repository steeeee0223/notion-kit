import { screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import { mockResizeObserver } from "@/__tests__/mock";

import { BulkActionMenu } from "./bulk-action-menu";

mockResizeObserver();

type DataChange = ResourceChange<Row[], DataResourceAction>;

function renderBulkActions() {
  const onDataChange = vi.fn<(change: DataChange) => void>();
  const table = renderTableView({
    onDataChange,
    children: <BulkActionMenu rowIds={["row1", "row2"]} />,
  });

  return { onDataChange, table };
}

it("BulkActionMenu_Duplicate_CreatesOneBatchResourceForTheSelectedRows", async () => {
  const { onDataChange, table } = renderBulkActions();

  await table.user.click(
    screen.getByRole("button", { name: "More bulk actions" }),
  );
  await table.user.click(
    await screen.findByRole("menuitem", { name: "Duplicate" }),
  );

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.calls[0]![0].action).toMatchObject({
    type: "data.rows.duplicate",
    payload: {
      duplicates: [
        { sourceRowId: "row1", nextPosition: 1 },
        { sourceRowId: "row2", nextPosition: 3 },
      ],
    },
  });
});

it("BulkActionMenu_TrashAndMenuDelete_UseTheSameCountAwareConfirmation", async () => {
  const { onDataChange, table } = renderBulkActions();

  await table.user.click(screen.getByRole("button", { name: "Delete 2 rows" }));
  expect(
    await screen.findByRole("heading", { name: "Delete 2 rows?" }),
  ).toBeVisible();
  await table.user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onDataChange).not.toHaveBeenCalled();

  await table.user.click(
    screen.getByRole("button", { name: "More bulk actions" }),
  );
  await table.user.click(
    await screen.findByRole("menuitem", { name: "Delete" }),
  );
  expect(
    await screen.findByRole("heading", { name: "Delete 2 rows?" }),
  ).toBeVisible();
  await table.user.click(screen.getByRole("button", { name: "Delete" }));

  await waitFor(() => expect(onDataChange).toHaveBeenCalledOnce());
  expect(onDataChange.mock.calls[0]![0].action).toMatchObject({
    type: "data.row.delete",
    payload: { rowIds: ["row1", "row2"] },
  });
});
