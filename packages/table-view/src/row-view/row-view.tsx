"use client";

import { DialogView } from "./dialog-view";
import { FullView } from "./full-view";
import { SideView } from "./side-view";

export function RowView() {
  return (
    <>
      <DialogView />
      <SideView />
      <FullView />
    </>
  );
}
