import type { Page, User } from "@notion-kit/schemas";

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

export const currentUser: User = {
  id: "u1",
  name: "Steve Yu",
  email: "steve@example.com",
  avatarUrl: "",
};

export const otherUsers: User[] = [
  {
    id: "u2",
    name: "Pong",
    email: "pong@example.com",
    avatarUrl: "",
  },
  {
    id: "u3",
    name: "Ming",
    email: "ming@example.com",
    avatarUrl: "",
  },
];
