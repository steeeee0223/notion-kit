# Connect an app to the shared auth server

Use this Fastify service as the auth endpoint for your own consumer apps. Each app uses the shared browser client and implements its own login, reset, and invitation pages.

## Configure the service

1. Set the required values in the [auth configuration reference](../../packages/auth/README.md#server-configuration). Keep credentials on the server.
2. Set `BETTER_AUTH_URL` to the service's public URL.
3. Set `APP_URL` to the default consumer URL.
4. Add each additional consumer origin to `TRUSTED_ORIGINS`, separated by commas. Use exact origins including the port during local development.
5. If the service is behind a reverse proxy, set `TRUSTED_PROXY_IPS` to the actual proxy addresses or CIDRs. Leave it unset for direct connections.
6. Configure Google and GitHub OAuth callbacks for the public auth service.
7. Configure Better Auth Infrastructure email on a Pro or higher plan. Set its server-only API key.
8. If the app uses billing, configure both Stripe secrets and real price IDs in `STRIPE_PLANS`.
9. If the app uses emoji or image uploads, configure Supabase storage and verify the required bucket policies.

For example, a service at `https://auth.example.com` can use `APP_URL=https://app.example.com` and `TRUSTED_ORIGINS=https://admin.example.com`. Origin allowlisting does not guarantee that a browser accepts cross-site cookies. Validate the actual domains before relying on shared login state.

## Run the service

From the repository root, use the repository's configured Node and pnpm versions:

```sh
pnpm -F @notion-kit/auth-server dev
```

The service reads the root `.env` through `with-env` and listens on `PORT`, or `3001` when `PORT` is unset.

For a built service, run these commands in order:

```sh
pnpm -F @notion-kit/auth-server build
pnpm -F @notion-kit/auth-server start
```

Check the built-in Better Auth endpoint `/api/auth/ok` for `{ "ok": true }`. Open `/api/auth/reference` for the generated API reference.

## Configure a consumer

1. Point `AuthProvider.authURL` at the public auth service.
2. Set `appURL` to the consumer's base URL.
3. Supply `resetPasswordURL` for the consumer's reset-token page.
4. Supply `billingReturnURL` if the consumer exposes billing.
5. Implement `/accept-invitation/{id}` with the invitation form.
6. Use the official client to read the session, sign in, sign out, and operate on organizations.
7. Pass the intended `organizationId` to organization operations that accept it.

The notion-clone example is a browser consumer; it no longer runs its own `/api/auth` handler or loads server credentials. Other apps can use the core auth client without rendering the settings panel.

If the browser blocks cookies on unrelated domains, use a deployment-specific same-origin forwarding arrangement and verify its callback and cookie behavior. Do not recreate auth logic in the consumer. The repository does not provide a general proxy setup or guarantee SSO across arbitrary domains.

## Verify a deployment

1. Test registration, email verification, reset, sign-in, session refresh, and sign-out from two configured app origins.
2. Test that an unlisted Origin receives `403`.
3. Test Google and GitHub callbacks with the deployed public URL.
4. Test an account that already has two-factor authentication enabled.
5. Test passkeys against the deployed origin and relying-party domain.
6. Verify real delivery to the intended mailboxes, including the original email during an email change.
7. Check background task failures in the hosting platform. The server uses `waitUntil`; API acceptance alone does not establish mail delivery.
8. If billing is enabled, test subscription changes and webhook event redelivery in Stripe test mode. Check the webhook destination's API version separately from SDK 22.6.2's `2026-08-26.dahlia` request version.
9. If storage is enabled, test uploads and deletion with the deployed Supabase policies.

The service uses Better Auth's database-backed rate limiter. Its transport overwrites `x-auth-client-ip` and trusts forwarded client addresses only through the configured proxy allowlist. The 7 MiB HTTP body limit permits the 5 MiB decoded-image limit after base64 encoding.

The HTTP adapter preserves raw webhook bytes, separate `Set-Cookie` headers, redirects, and error status codes. Its request URL comes from the configured public auth URL rather than an incoming Host or forwarded host. Transport tests do not replace real cookie, proxy, OAuth, email, storage, or Stripe integration checks.

Do not run migrations or `db:push` as part of this upgrade. The target databases are empty, and the change updates the repository's final schema only. See the [audit record](../../tasks/auth-audit.md) for verification boundaries.
