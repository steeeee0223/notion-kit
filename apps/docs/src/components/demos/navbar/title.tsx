"use client";

import { useState } from "react";

import { Title } from "@notion-kit/navbar";
import { Page } from "@notion-kit/schemas";

export const defaultPage: Page = {
  type: "page",
  id: "12",
  title: "Title",
  isArchived: false,
  parentId: null,
  isPublished: false,
  isFavorite: true,
  createdAt: 0,
  lastEditedAt: 0,
  createdBy: "admin",
  lastEditedBy: "admin",
};

export default function Demo() {
  const [page, setPage] = useState(defaultPage);
  return (
    <Title
      page={page}
      onUpdate={(data) => setPage((prev) => ({ ...prev, ...data }))}
    />
  );
}
