import { Menu } from "@notion-kit/navbar/presets";
import type { Page } from "@notion-kit/schemas";
import { TooltipProvider } from "@notion-kit/shadcn";

export const page: Page = {
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
  return (
    <TooltipProvider>
      <Menu page={page} />
    </TooltipProvider>
  );
}
