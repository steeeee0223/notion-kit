"use client";

import { useState } from "react";

import { Publish } from "@notion-kit/navbar/presets";
import { Page } from "@notion-kit/schemas";
import { TooltipProvider } from "@notion-kit/shadcn";

export const defaultPage: Page = {
  type: "page",
  id: "12",
  title: "Title",
  isArchived: false,
  parentId: null,
  isPublished: false,
  isFavorite: true,
  publicUrl: "docs/blocks/navbar/presets",
  createdAt: 0,
  lastEditedAt: 0,
  createdBy: "admin",
  lastEditedBy: "admin",
};

export default function Demo() {
  const [page, setPage] = useState(defaultPage);
  return (
    <TooltipProvider>
      <Publish
        page={page}
        onUpdate={(_, isPublished) =>
          setPage((prev) => ({ ...prev, isPublished }))
        }
      />
    </TooltipProvider>
  );
}
