import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { useCellEditorSelection } from "./use-cell-editor-selection";

const { cell, controller } = vi.hoisted(() => ({
  cell: { id: "cell" },
  controller: { open: vi.fn(), close: vi.fn() },
}));
vi.mock("./cell", () => ({ useOptionalCellContext: () => ({ cell }) }));
vi.mock("@/table-contexts/cell-selection-provider", () => ({
  useCellSelection: () => ({ controller }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  controller.open.mockReturnValueOnce(1).mockReturnValueOnce(2);
});

it("refreshes ownership when reopening before the close animation completes", () => {
  const { result } = renderHook(useCellEditorSelection);
  act(() => result.current[1](true));
  act(() => result.current[1](false));
  act(() => result.current[1](true));
  expect(controller.open).toHaveBeenCalledTimes(2);
  expect(controller.close).toHaveBeenCalledWith(1, false);
  controller.close.mockClear();
  // A completion left over from the cancelled close must not close the new session.
  act(() => result.current[2](false));
  expect(controller.close).not.toHaveBeenCalled();
  act(() => result.current[1](false));
  act(() => result.current[2](false));
  expect(controller.close).toHaveBeenCalledWith(2);
});

it("restores focus only after closing completes and never during unmount", () => {
  const { result, unmount } = renderHook(useCellEditorSelection);
  act(() => result.current[1](true));
  act(() => result.current[1](false));
  expect(controller.close).not.toHaveBeenCalled();
  unmount();
  expect(controller.close).toHaveBeenCalledWith(1, false);
});
