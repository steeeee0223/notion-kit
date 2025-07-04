"use client";

import { useMemo } from "react";

import { Role } from "@notion-kit/schemas";

import { useSettings } from "../../core";
import type { WorkspaceMemberships } from "../../lib";

export function usePeople() {
  const {
    settings: { memberships },
  } = useSettings();

  return useMemo(
    () =>
      Object.values(memberships).reduce<WorkspaceMemberships>(
        (acc, mem) =>
          mem.role === Role.GUEST
            ? { members: acc.members, guests: [...acc.guests, mem] }
            : { members: [...acc.members, mem], guests: acc.guests },
        { members: [], guests: [] },
      ),
    [memberships],
  );
}
