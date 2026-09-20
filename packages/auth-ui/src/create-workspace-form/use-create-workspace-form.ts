import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import z from "zod/v4";

import type { Organization } from "@notion-kit/auth/client";
import { IconObject, type IconData } from "@notion-kit/schemas";

import { useAuth } from "../auth-provider";
import { handleError, toSlugLike } from "../lib";

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  icon: IconObject,
});
type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>;

export const defaultIcon: IconData = { type: "text", src: "A" };

interface UseCreateWorkspaceFormOptions {
  onSuccess?: (workspace: Organization) => void;
}

export function useCreateWorkspaceForm({
  onSuccess,
}: UseCreateWorkspaceFormOptions) {
  const { auth } = useAuth();

  const form = useForm<CreateWorkspaceSchema>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", icon: defaultIcon },
  });
  const { handleSubmit, setValue, watch } = form;

  const submit = handleSubmit(async (values) => {
    const slug = `${toSlugLike(values.name) || "workspace"}-${v4().slice(0, 8)}`;
    const available = await auth.organization.checkSlug({ slug });
    if (available.error) return handleError(available, "Check workspace slug");

    const res = await auth.organization.create({
      name: values.name,
      slug,
      logo: JSON.stringify(values.icon),
      keepCurrentActiveOrganization: false,
    });
    if (!res.data) return handleError(res, "Create workspace error");
    const active = await auth.organization.setActive({
      organizationId: res.data.id,
    });
    if (active.error) return handleError(active, "Activate workspace error");
    onSuccess?.(res.data);
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
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

  return { form, submit };
}
