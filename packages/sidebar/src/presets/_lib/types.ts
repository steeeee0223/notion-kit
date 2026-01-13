import React from "react";

import type { IconData, Page } from "@notion-kit/schemas";

export type Listener = () => void;

export type TreeData = Page & {
  iconData?: IconData;
  icon?: React.ReactNode; // use iconData to render icon
  // the `parentId` is used for rendering the tree
  // TODO is this prop neccesary?
  originalParentId?: string | null; // this will be the actual parent of the `Page`
};
