"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod/v4";

import { useAuth } from "../auth-provider";
import { handleError } from "../lib";

const acceptInvitationSchema = z.object({
  invitationId: z.string().min(1),
});
type AcceptInvitationSchema = z.infer<typeof acceptInvitationSchema>;

export function useAcceptInvitationForm(invitationId: string) {
  const { auth } = useAuth();
  const form = useForm<AcceptInvitationSchema>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { invitationId },
  });

  const submit = form.handleSubmit(async (values) => {
    const res = await auth.organization.acceptInvitation({
      invitationId: values.invitationId,
    });
    if (res.error) {
      return handleError(res, "Accepting invitation failed");
    }
  });

  return { form, submit };
}
