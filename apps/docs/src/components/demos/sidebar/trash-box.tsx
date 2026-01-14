"use client";

import { ModalProvider } from "@notion-kit/modal";
import { Page } from "@notion-kit/schemas";
import { TrashBox, usePages } from "@notion-kit/sidebar/presets";
import { randomInt } from "@notion-kit/utils";

const getRandomTs = () =>
  randomInt(Date.UTC(2024, 1, 1), Date.UTC(2024, 10, 31));

export const data: Page[] = [
  {
    type: "document",
    id: "page1",
    title: "Korean",
    parentId: null,
    icon: {
      type: "url",
      src: "https://img.freepik.com/premium-vector/line-art-flag-language-korean-illustration-vector_490632-422.jpg",
    },
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isArchived: false,
    isFavorite: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "document",
    id: "page2",
    title: "Pronunciation",
    parentId: "page1",
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: false,
    isArchived: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "document",
    id: "page3",
    title: "Study list",
    parentId: null,
    icon: { type: "lucide", src: "book", color: "#CB912F" },
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: true,
    isArchived: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "document",
    id: "page4",
    title: "My secret document",
    icon: { type: "lucide", src: "book-check", color: "#CB912F" },
    parentId: null,
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: false,
    isArchived: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "document",
    id: "page5",
    title: "System flowchart",
    parentId: null,
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: false,
    isArchived: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "document",
    id: "page6",
    title: "Deprecated documents",
    parentId: null,
    icon: { type: "lucide", src: "book", color: "#337EA9" },
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: false,
    isArchived: true,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "private",
    id: "page7",
    title: "TODO List",
    parentId: null,
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: false,
    isArchived: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "shared",
    id: "page8",
    title: "System flowchart",
    parentId: null,
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: false,
    isArchived: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "document",
    id: "page9",
    parentId: "page3",
    title: "The High Table",
    icon: {
      type: "url",
      src: "https://cdn.iconscout.com/icon/premium/png-256-thumb/bar-table-1447763-1224177.png",
    },
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: false,
    isArchived: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
  {
    type: "document",
    id: "page10",
    parentId: "page3",
    title: "The Continental",
    icon: { type: "emoji", src: "🏠" },
    lastEditedBy: "",
    lastEditedAt: getRandomTs(),
    isFavorite: false,
    isArchived: false,
    isPublished: false,
    createdAt: Date.UTC(2023, 3, 5),
    createdBy: "",
  },
];

export default function Demo() {
  const pages = usePages({ pages: data });
  return (
    <ModalProvider>
      <div className="w-[200px]">
        <TrashBox pages={pages.archivedPages()} />
      </div>
    </ModalProvider>
  );
}
