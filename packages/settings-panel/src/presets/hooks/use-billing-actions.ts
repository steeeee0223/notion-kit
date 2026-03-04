import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Plan } from "@notion-kit/schemas";
import { toast } from "@notion-kit/shadcn";

import { useSettingsApi } from "@/core/settings-provider";
import { createDefaultFn, QUERY_KEYS } from "@/lib/queries";
import type { BillingStore } from "@/lib/types";

import { useWorkspace } from "./queries";

export function useBillingActions() {
  const queryClient = useQueryClient();
  const { billing: actions } = useSettingsApi();
  const { data: workspace } = useWorkspace();
  const queryKey = QUERY_KEYS.billing(workspace.id);

  const { mutateAsync: upgrade, isPending: isUpgrading } = useMutation({
    mutationFn: (params: { plan: Plan; annual: boolean }) =>
      actions?.upgrade?.(params.plan, params.annual) ?? createDefaultFn()(),
    onError: (e) => toast.error("Upgrade failed", { description: e.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: changePlan } = useMutation({
    mutationFn: actions?.changePlan ?? createDefaultFn(),
    onError: (e) =>
      toast.error("Change plan failed", { description: e.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: editMethod, isPending: isEditingMethod } = useMutation({
    mutationFn: actions?.editMethod ?? createDefaultFn(),
    onError: (e) =>
      toast.error("Edit payment method failed", { description: e.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutateAsync: editBilledTo, isPending: isEditingBilledTo } =
    useMutation({
      mutationFn: actions?.editBilledTo ?? (async () => {}),
      onError: (e) =>
        toast.error("Update billing address failed", {
          description: e.message,
        }),
      onSettled: () => queryClient.invalidateQueries({ queryKey }),
    });

  const { mutateAsync: editEmail, isPending: isEditingEmail } = useMutation({
    mutationFn: actions?.editEmail ?? (async () => {}),
    onError: (e) =>
      toast.error("Update billing email failed", { description: e.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { mutate: toggleInvoiceEmails } = useMutation({
    mutationFn: async (checked: boolean) =>
      actions?.toggleInvoiceEmails?.(checked),
    onMutate: async (checked) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<BillingStore>(queryKey);
      queryClient.setQueryData<BillingStore>(queryKey, (v) => {
        if (!v) return v;
        return { ...v, invoiceEmails: checked };
      });
      return { prev };
    },
    onError: (e, _, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
      toast.error("Toggle invoice emails failed", {
        description: e.message,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const editVat = actions?.editVat;
  const viewInvoice = actions?.viewInvoice;

  return {
    isUpgrading,
    isEditingMethod,
    isEditingBilledTo,
    isEditingEmail,
    upgrade,
    changePlan,
    editMethod,
    editBilledTo,
    editEmail,
    toggleInvoiceEmails,
    editVat,
    viewInvoice,
  };
}
