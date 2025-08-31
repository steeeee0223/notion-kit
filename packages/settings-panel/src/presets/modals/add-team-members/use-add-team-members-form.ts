"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { UserObject, type User } from "@notion-kit/schemas";

import type { TeamspaceRole } from "../../../lib";

const teamMembersFormSchema = z.object({
  users: z.array(UserObject).min(1),
  role: z.enum(["owner", "member"]),
});
type TeamMembersFormSchema = z.infer<typeof teamMembersFormSchema>;

interface WorkspaceMember extends User {
  invited?: boolean;
}

interface UseAddTeamMembersFormOptions {
  workspaceMembers: WorkspaceMember[];
  onSubmit?: (data: {
    userIds: string[];
    role: TeamspaceRole;
  }) => Promise<void>;
}

export function useAddTeamMembersForm({
  workspaceMembers,
  onSubmit,
}: UseAddTeamMembersFormOptions) {
  const members = useMemo(
    () => new Map(workspaceMembers.map((user) => [user.name, user])),
    [workspaceMembers],
  );

  const form = useForm<TeamMembersFormSchema>({
    resolver: zodResolver(teamMembersFormSchema),
    defaultValues: { users: [], role: "owner" },
  });
  const { handleSubmit } = form;

  const submit = handleSubmit(async (values) => {
    await onSubmit?.({
      userIds: values.users.map((user) => user.id),
      role: values.role,
    });
  });

  return { members, form, submit };
}
