import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { UserObject } from "@notion-kit/schemas";

import type { TeamspaceRole } from "../../../../lib";

const teamMembersFormSchema = z.object({
  users: z.array(UserObject).min(1),
  role: z.enum(["owner", "member"]),
});
export type TeamMembersFormSchema = z.infer<typeof teamMembersFormSchema>;

interface UseAddTeamMembersFormOptions {
  onSubmit?: (data: {
    userIds: string[];
    role: TeamspaceRole;
  }) => Promise<void>;
}

export function useAddTeamMembersForm({
  onSubmit,
}: UseAddTeamMembersFormOptions) {
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

  return { form, submit };
}
