import { useEffect, useRef, useState } from "react";

import { useCellSelection } from "@/table-contexts/cell-selection-provider";

import { useOptionalCellContext } from "./cell";

/** Shared popovers also render outside cells; selection coordination is optional. */
export function useCellEditorSelection() {
  const cell = useOptionalCellContext()?.cell;
  const selection = useCellSelection();
  const controller = selection?.controller;
  const [open, setState] = useState(false);
  const session = useRef<number | null>(null);
  const opening = useRef(false);
  const setOpen = (next: boolean) => {
    opening.current = next;
    if (next && cell && controller) {
      // Reopening during a closing animation is a new focus owner.
      if (session.current !== null) controller.close(session.current, false);
      session.current = controller.open(cell, () => {
        session.current = null;
        opening.current = false;
        setState(false);
      });
    }
    setState(next);
  };
  const onOpenChangeComplete = (next: boolean) => {
    // Restore focus only after the editor unmounts, avoiding a blur commit
    // from a draft that was cancelled with Escape.
    if (!next && !opening.current && session.current !== null) {
      controller?.close(session.current);
      session.current = null;
    }
  };
  useEffect(
    () => () => {
      if (session.current !== null) controller?.close(session.current, false);
    },
    [controller],
  );
  return [open, setOpen, onOpenChangeComplete] as const;
}
