"use client";

import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import { Navbar, NavbarItem } from "@notion-kit/navbar";
import {
  History,
  Menu,
  Participants,
  Publish,
  Title,
} from "@notion-kit/navbar/presets";
import type { Page, User } from "@notion-kit/schemas";

const defaultPage: Page = {
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

const currentUser: User = {
  id: "u1",
  name: "Steve Yu",
  email: "steve@example.com",
  avatarUrl: "",
};

const otherUsers: User[] = [
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

export const NavbarDemo = () => {
  const [page, setPage] = useState(defaultPage);
  return (
    <Navbar>
      <div className="flex w-full items-center justify-between gap-6">
        <Title
          page={page}
          onUpdate={(data) => setPage((prev) => ({ ...prev, ...data }))}
        />
        <div className="z-30 flex items-center gap-x-1">
          <Participants currentUser={currentUser} otherUsers={otherUsers} />
          <Publish
            page={page}
            onUpdate={(_, isPublished) =>
              setPage((prev) => ({ ...prev, isPublished }))
            }
          />
          <History pageId={page.id} />
          <NavbarItem hint="View all comments">
            <Icon.CommentFilled className="size-5 fill-[#32302c] dark:fill-primary" />
          </NavbarItem>
          <NavbarItem
            hint={`${page.isFavorite ? "Remove from" : "Add to"} your favorites`}
            onClick={() =>
              setPage((prev) => ({ ...prev, isFavorite: !prev.isFavorite }))
            }
          >
            {page.isFavorite ? (
              <Icon.StarFill className="size-5 fill-[#f6c050]" />
            ) : (
              <Icon.Star className="size-5 fill-[#32302c] dark:fill-primary" />
            )}
          </NavbarItem>
          <Menu page={page} />
        </div>
      </div>
    </Navbar>
  );
};
