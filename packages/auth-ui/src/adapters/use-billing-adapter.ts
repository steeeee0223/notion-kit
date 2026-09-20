"use client";

import { useMemo } from "react";
import { z } from "zod/v4";

import type { BillingAdapter } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";

const customerSchema = z
  .object({ email: z.string().nullable(), name: z.string().nullable() })
  .nullable();

export function useBillingAdapter(): BillingAdapter | undefined {
  const { billingReturnURL, auth } = useAuth();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const subApi = auth.subscription;
  const stripeExtraApi = auth.stripeExtra;

  return useMemo<BillingAdapter | undefined>(() => {
    if (!organizationId) return undefined;
    if (!billingReturnURL) return undefined;
    const billingReturnUrl = billingReturnURL;
    return {
      getAll: async () => {
        const [subscriptionResult, customerResult] = await Promise.all([
          subApi.list({
            query: {
              referenceId: organizationId,
              customerType: "organization",
            },
          }),
          stripeExtraApi.getCustomer({
            query: { organizationId },
          }),
        ]);
        if (subscriptionResult.error)
          throw new Error(subscriptionResult.error.message);
        if (customerResult.error) throw new Error(customerResult.error.message);
        const subscriptions = subscriptionResult.data;
        const customer = customerSchema.parse(customerResult.data);
        const active = subscriptions.find(
          (s) => s.status === "active" || s.status === "trialing",
        );
        return {
          billingEmail: customer?.email ?? undefined,
          billedTo: customer?.name ?? undefined,
          upcomingInvoice: active ? `${active.plan} plan` : undefined,
        };
      },
      upgrade: async (plan, annual) => {
        await subApi.upgrade(
          {
            plan: plan.toLowerCase(),
            annual,
            referenceId: organizationId,
            customerType: "organization",
            successUrl: billingReturnUrl,
            cancelUrl: billingReturnUrl,
          },
          { throw: true },
        );
      },
      changePlan: async (plan) => {
        await subApi.upgrade(
          {
            plan: plan.toLowerCase(),
            referenceId: organizationId,
            customerType: "organization",
            successUrl: billingReturnUrl,
            cancelUrl: billingReturnUrl,
          },
          { throw: true },
        );
      },
      editMethod: async () => {
        await subApi.billingPortal(
          {
            referenceId: organizationId,
            customerType: "organization",
            returnUrl: billingReturnUrl,
          },
          { throw: true },
        );
      },
      editEmail: async (email) => {
        await stripeExtraApi.updateCustomer(
          {
            organizationId,
            email,
          },
          { throw: true },
        );
      },
      editBilledTo: async (address) => {
        await stripeExtraApi.updateCustomer(
          {
            organizationId,
            name: address.businessName,
            address: address.address,
          },
          { throw: true },
        );
      },
      viewInvoice: async () => {
        await subApi.billingPortal(
          {
            referenceId: organizationId,
            customerType: "organization",
            returnUrl: billingReturnUrl,
          },
          { throw: true },
        );
      },
    };
  }, [subApi, stripeExtraApi, organizationId, billingReturnURL]);
}
