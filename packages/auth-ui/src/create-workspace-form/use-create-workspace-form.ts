"use client";

import { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import z from "zod/v4";

import type { Organization, WorkspaceMetadata } from "@notion-kit/auth";
import { IconObject, type IconData } from "@notion-kit/schemas";

import { useAuth } from "../auth-provider";
import { handleError } from "../lib";

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  icon: IconObject,
});
type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>;

const defaultIcon: IconData = { type: "text", src: "A" };

interface UseCreateWorkspaceFormOptions {
  onSuccess?: (workspace: Organization) => void;
}

export function useCreateWorkspaceForm({
  onSuccess,
}: UseCreateWorkspaceFormOptions) {
  const { auth, generateUniqueSlug } = useAuth();

  const form = useForm<CreateWorkspaceSchema>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", icon: defaultIcon },
  });
  const { handleSubmit, setValue, watch } = form;

  const removeIcon = useCallback(
    () => setValue("icon", defaultIcon),
    [setValue],
  );

  const uploadIcon = useCallback(
    (file: File) =>
      setValue("icon", {
        type: "url",
        src: URL.createObjectURL(file),
      }),
    [setValue],
  );

  const submit = handleSubmit(async (values) => {
    const slug = await generateUniqueSlug(values.name);
    const res = await auth.organization.create({
      name: values.name,
      slug,
      logo: JSON.stringify(values.icon),
      metadata: { inviteLink: v4() } satisfies WorkspaceMetadata,
      keepCurrentActiveOrganization: false,
    });
    if (!res.data) return handleError(res, "Create workspace error");
    onSuccess?.(res.data);
    await auth.organization.setActive({
      organizationId: res.data.id,
    });
  });

  useEffect(() => {
    const sub = watch((value, info) => {
      if (info.name !== "name") return;
      if (value.icon?.type !== "text") return;
      // Update the icon if it is not set
      setValue(
        "icon",
        value.name
          ? { type: "text", src: value.name.at(0) ?? "" }
          : defaultIcon,
      );
    });
    return () => sub.unsubscribe();
  }, [setValue, watch]);

  return { form, uploadIcon, removeIcon, submit };
}
