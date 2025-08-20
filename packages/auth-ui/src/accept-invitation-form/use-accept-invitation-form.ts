"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod/v4";

import type { IconData } from "@notion-kit/schemas";

import { useAuth } from "../auth-provider";
import { handleError } from "../lib";

const acceptInvitationSchema = z.object({
  invitationId: z.string().min(1),
});
type AcceptInvitationSchema = z.infer<typeof acceptInvitationSchema>;

interface Workspace {
  id: string;
  name: string;
  icon: IconData;
  slug: string;
}

interface UseAcceptInvitationFormOptions {
  invitationId: string;
  onAccept?: (workspace: Omit<Workspace, "icon">) => void;
}

export function useAcceptInvitationForm({
  invitationId,
  onAccept,
}: UseAcceptInvitationFormOptions) {
  const { auth } = useAuth();

  const getInvitationFn = useRef(auth.organization.getInvitation);
  const [isFetching, setIsFetching] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>({
    id: "",
    name: "Acme Inc.",
    icon: { type: "text", src: "A" },
    slug: "",
  });
  useEffect(() => {
    setIsFetching(true);
    void getInvitationFn
      .current({ query: { id: invitationId } })
      .then((res) => {
        if (res.error) {
          handleError(res, "Fetch invitation failed");
          return;
        }
        setWorkspace({
          id: res.data.organizationId,
          name: res.data.organizationName,
          icon: { type: "text", src: res.data.organizationName },
          slug: res.data.organizationSlug,
        });
        setIsFetching(false);
      });
  }, [invitationId]);

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
    const { icon: _, ...data } = workspace;
    onAccept?.(data);
  });

  return { form, isFetching, workspace, submit };
}
