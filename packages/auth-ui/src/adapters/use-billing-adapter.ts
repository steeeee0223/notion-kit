"use client";

import { useMemo } from "react";

import type { BillingAdapter } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";

export function useBillingAdapter(): BillingAdapter | undefined {
  const { baseURL, auth } = useAuth();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const subApi = auth.subscription;
  const stripeExtraApi = auth.stripeExtra;

  return useMemo<BillingAdapter | undefined>(() => {
    if (!organizationId) return undefined;
    const billingReturnUrl = `${baseURL}/settings/billing`;
    return {
      getAll: async () => {
        const [{ data: subscriptions }, { data: customer }] = await Promise.all(
          [
            subApi.list({
              query: {
                referenceId: organizationId,
                customerType: "organization",
              },
            }),
            stripeExtraApi.getCustomer({
              query: { organizationId },
            }),
          ],
        );
        const active = subscriptions?.find(
          (s) => s.status === "active" || s.status === "trialing",
        );
        return {
          billingEmail: customer?.email ?? undefined,
          billedTo: customer?.name ?? undefined,
          upcomingInvoice: active ? `${active.plan} plan` : undefined,
        };
      },
      upgrade: async (plan, annual) => {
        await subApi.upgrade({
          plan: plan.toLowerCase(),
          annual,
          referenceId: organizationId,
          customerType: "organization",
          successUrl: billingReturnUrl,
          cancelUrl: billingReturnUrl,
        });
      },
      changePlan: async (plan) => {
        await subApi.upgrade({
          plan: plan.toLowerCase(),
          referenceId: organizationId,
          customerType: "organization",
          successUrl: billingReturnUrl,
          cancelUrl: billingReturnUrl,
        });
      },
      editMethod: async () => {
        await subApi.billingPortal({
          referenceId: organizationId,
          customerType: "organization",
          returnUrl: billingReturnUrl,
        });
      },
      editEmail: async (email) => {
        await stripeExtraApi.updateCustomer({
          organizationId,
          email,
        });
      },
      editBilledTo: async (address) => {
        await stripeExtraApi.updateCustomer({
          organizationId,
          name: address.businessName,
          address: address.address,
        });
      },
      viewInvoice: () => {
        void subApi.billingPortal({
          referenceId: organizationId,
          customerType: "organization",
          returnUrl: billingReturnUrl,
        });
      },
    };
  }, [subApi, stripeExtraApi, organizationId, baseURL]);
}
