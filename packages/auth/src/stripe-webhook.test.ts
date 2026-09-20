import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { createAuth } from "./auth";

describe("official Stripe webhook", () => {
  const secret = "whsec_local_signature_fixture_only";
  const stripe = new Stripe("sk_test_local_signature_fixture_only");
  const auth = createAuth({
    POSTGRES_URL: "postgresql://test:test@localhost:5432/test",
    BETTER_AUTH_URL: "https://auth.example.com",
    BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
    BETTER_AUTH_API_KEY: "test-email-key",
    TRUSTED_ORIGINS: [],
    GOOGLE_CLIENT_ID: "test",
    GOOGLE_CLIENT_SECRET: "test",
    GITHUB_CLIENT_ID: "test",
    GITHUB_CLIENT_SECRET: "test",
    NODE_ENV: "test",
    STRIPE_SECRET_KEY: "sk_test_local_signature_fixture_only",
    STRIPE_WEBHOOK_SECRET: secret,
  });
  // An unrelated event exercises verification without touching subscription data.
  const payload =
    '{ "id": "evt_fixture", "type": "test.fixture", "data": { "object": {} } }';

  it("accepts a correctly signed event and its delivery retry", async () => {
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
    });
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await auth.handler(
        new Request("https://auth.example.com/api/auth/stripe/webhook", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "stripe-signature": signature,
          },
          body: payload,
        }),
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
    }
  });

  it("rejects a payload changed after signing", async () => {
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
    });
    const response = await auth.handler(
      new Request("https://auth.example.com/api/auth/stripe/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": signature,
        },
        body: payload.replace("evt_fixture", "evt_tampered"),
      }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      code: "FAILED_TO_CONSTRUCT_STRIPE_EVENT",
    });
  });
});
