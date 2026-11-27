# Connect an app to the shared auth server

The Fastify service runs Better Auth for your apps. Each app uses the shared browser client and hosts its login, password reset, and invitation pages.

## Configure the service

1. In the repository root, create `.env` from `.env.example`. Fill in the required values from the [auth configuration reference](../../packages/auth/README.md#server-configuration).
2. Set `BETTER_AUTH_URL` to the service's public URL and `APP_URL` to the default consumer's base URL. For example, use `https://auth.example.com` for the service and `https://app.example.com` for the consumer.
3. Add any other consumer origins to `TRUSTED_ORIGINS` as a comma-separated list. Include the port when the origin uses one.
4. If you run the service behind a reverse proxy, set `TRUSTED_PROXY_IPS` to the addresses or CIDRs of the proxies you trust.
5. Point the Google and GitHub OAuth callbacks at the public auth service.
6. Set the server-only `BETTER_AUTH_API_KEY` for a Better Auth Infrastructure Pro plan or higher.
7. If you offer billing, configure both Stripe secrets and set `STRIPE_PLANS` to the paid plans and their Stripe price IDs.
8. If you support emoji or image uploads, configure Supabase storage and check the bucket policies.

## Run the service

Build the auth server and its workspace dependencies from the repository root.

```sh
pnpm build --filter=@notion-kit/auth-server
```

Start the service with `pnpm -F @notion-kit/auth-server start`. To run the source in development, use `pnpm -F @notion-kit/auth-server dev`.

Both commands read the root `.env`. The server listens on `PORT`, which defaults to `3001`. Send a `GET` request to `/api/auth/ok` and check for `{ "ok": true }`. Open `/api/auth/reference` for the OpenAPI reference.

## Configure a consumer

1. Set `AuthProvider.authURL` to the public auth service URL and `appURL` to the consumer's base URL.
2. Set `resetPasswordURL` to the consumer's reset-token page.
3. If the consumer exposes billing and the service has Stripe enabled, set `billingReturnURL` to the consumer's billing return page. The billing adapter stays disabled when the URL is absent.
4. Add the invitation form at `/accept-invitation/{id}`.
5. Use `@notion-kit/auth/client` for session reads, sign-in, sign-out, and organization operations. Pass the intended `organizationId` when the operation accepts one.

Relative reset and billing URLs resolve against the consumer's origin. If the browser blocks cookies for the deployed domains, route auth requests through a same-origin proxy to the shared service. Check cookies, callbacks, and passkeys with that route.

### Configure the notion-clone example

The example runs on port `3002`. Set `NEXT_PUBLIC_AUTH_URL` to the shared service URL. Keep Stripe secrets on the auth server. To show billing controls after enabling Stripe on the server, set `NEXT_PUBLIC_AUTH_BILLING_ENABLED=true` in the consumer environment. The flag defaults to `false` and accepts `true` or `false`.

## Verify a deployment

Use the deployed service URL and the consumer URLs for these checks.

- Complete registration, email verification, password reset, sign-in, session refresh, and sign-out from two allowed origins. Confirm that a request with an unlisted origin returns `403`.
- Complete the Google and GitHub sign-in callbacks. Sign in as a user with two-factor authentication and try a passkey on the deployed origin and relying-party domain.
- Confirm delivery to the intended inboxes, including the current email address during an email change. Check the host's background task logs for email failures.
- If billing is enabled, test subscription changes and webhook redelivery in Stripe test mode. Verify the webhook destination's API version and [the SDK request version](../../packages/auth/README.md#versions).
- If Supabase storage is enabled, test uploads and deletion using the deployed bucket policies.
- Check the constraints and relations in the deployed PostgreSQL schema.
- Switch the active organization in another tab, then verify that actions with an explicit organization ID still affect the intended organization.
- Exercise expired and canceled invitations, simultaneous requests for the same workspace slug, and partial failures in batch member changes.

The schema in this upgrade targets empty databases. The upgrade includes no database operations. See the [shared auth service decision](../../docs/adr/0008-shared-auth-service-and-official-better-auth-features.md) for the scope of local verification.
