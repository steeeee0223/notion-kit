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

import { currentUser, defaultPage, otherUsers } from "./data";

export default function Notion() {
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
}
