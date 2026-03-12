import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import type Stripe from "stripe";
import { z } from "zod/v4";

const addressSchema = z.object({
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
});

export function stripeExtra(opts: { stripeClient: Stripe }) {
  const { stripeClient } = opts;

  return {
    id: "stripe-extra",
    endpoints: {
      getCustomer: createAuthEndpoint(
        "/stripe-extra/get-customer",
        {
          method: "GET",
          query: z.object({ organizationId: z.string() }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const org = await ctx.context.adapter.findOne<{
            stripeCustomerId: string | null;
          }>({
            model: "organization",
            where: [{ field: "id", value: ctx.query.organizationId }],
          });
          if (!org?.stripeCustomerId) {
            return ctx.json(null);
          }
          const customer = await stripeClient.customers.retrieve(
            org.stripeCustomerId,
          );
          if (customer.deleted) {
            return ctx.json(null);
          }
          return ctx.json({
            email: customer.email,
            name: customer.name,
            address: customer.address,
            invoiceSettings: {
              defaultPaymentMethod:
                typeof customer.invoice_settings.default_payment_method ===
                "string"
                  ? customer.invoice_settings.default_payment_method
                  : (customer.invoice_settings.default_payment_method?.id ??
                    null),
            },
          });
        },
      ),
      updateCustomer: createAuthEndpoint(
        "/stripe-extra/update-customer",
        {
          method: "POST",
          body: z.object({
            organizationId: z.string(),
            email: z.email().optional(),
            name: z.string().optional(),
            address: addressSchema.optional(),
          }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const org = await ctx.context.adapter.findOne<{
            stripeCustomerId: string | null;
          }>({
            model: "organization",
            where: [{ field: "id", value: ctx.body.organizationId }],
          });
          if (!org?.stripeCustomerId) {
            throw new Error("No Stripe customer for this organization");
          }
          await stripeClient.customers.update(org.stripeCustomerId, {
            ...(ctx.body.email !== undefined && { email: ctx.body.email }),
            ...(ctx.body.name !== undefined && { name: ctx.body.name }),
            ...(ctx.body.address !== undefined && {
              address: {
                ...ctx.body.address,
                line2: ctx.body.address.line2 ?? undefined,
              },
            }),
          });
          return ctx.json({ ok: true });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
}
