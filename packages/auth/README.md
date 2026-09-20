# @notion-kit/auth

Shared Better Auth configuration for the standalone [auth server](../../apps/auth-server/README.md), browser clients, and optional settings data endpoints. The server owns authentication and organization data. Consumer apps do not instantiate a second auth server.

## Versions

The upgrade selects Better Auth, `@better-auth/passkey`, and `@better-auth/stripe` 1.7.5, plus `@better-auth/infra` 0.4.9. Stripe Node SDK 22.6.2 uses API version `2026-08-26.dahlia`. The workspace Zod catalog is 4.6.5, satisfying Better Auth's ^4.5.4 peer requirement. The browser Stripe packages remain on their existing compatible ranges: `@stripe/stripe-js` ^8.7.0 and `@stripe/react-stripe-js` ^5.6.0.

Stripe's SDK request version and each webhook destination's event version are separate settings. Updating the SDK does not update the Stripe Dashboard. Webhook compatibility therefore needs its own test before deployment. See [Stripe API upgrades](https://docs.stripe.com/upgrades).

## Server configuration

`createAuth(env, options)` accepts an `AuthEnv` value. `createAuthEnv()` validates the process environment. Configuration is instance-local, including the database connection, secret, public URL, storage client, and email sender.

| Variable                                     | Requirement                                       | Meaning                                                                                           |
| -------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `POSTGRES_URL`                               | Required                                          | PostgreSQL connection string.                                                                     |
| `BETTER_AUTH_URL`                            | Required URL                                      | Fixed public auth URL. The default API prefix is `/api/auth`.                                     |
| `BETTER_AUTH_SECRET`                         | Required, at least 32 characters                  | Server signing and encryption secret.                                                             |
| `APP_URL`                                    | Optional URL                                      | Default consumer app for requests without an accepted Origin. Defaults to `BETTER_AUTH_URL`.      |
| `TRUSTED_ORIGINS`                            | Comma-separated origins                           | Additional consumer origins. `APP_URL`'s origin is included automatically.                        |
| `TRUSTED_PROXY_IPS`                          | Optional comma-separated proxy addresses or CIDRs | Fastify proxy trust allowlist. An absent value leaves proxy headers untrusted.                    |
| `PASSKEY_RP_ID`                              | Optional hostname                                 | Passkey relying-party domain override for the deployment.                                         |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`   | Required                                          | Google OAuth credentials.                                                                         |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`   | Required                                          | GitHub OAuth credentials.                                                                         |
| `BETTER_AUTH_API_KEY`                        | Required                                          | Server-only Better Auth Infrastructure key.                                                       |
| `BETTER_AUTH_API_URL`                        | Optional URL                                      | Override for the official Infrastructure API endpoint.                                            |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Optional pair                                     | Together enable Stripe subscriptions and customer endpoints.                                      |
| `STRIPE_PLANS`                               | Optional JSON array                               | Server-owned paid plan names and Stripe price IDs. An absent value produces no purchasable plans. |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`   | Optional pair                                     | Together enable emoji and image storage endpoints. Bucket policies remain a deployment concern.   |
| `NODE_ENV`                                   | Optional                                          | `development`, `production`, or `test`; defaults to `development`.                                |

A plan entry contains `name`, `priceId`, and optional `annualDiscountPriceId`. Names are `education`, `plus`, `business`, or `enterprise`. Prices belong to the shared auth service's organizations; there is no per-app plan registry. The free plan has no placeholder Stripe price.

`options.basePath` changes the factory's API prefix. `options.backgroundTasks` supplies Better Auth's task lifecycle handler. The bundled Fastify server exposes `/api/auth`; a different prefix also requires corresponding transport routes.

The server uses Better Auth's database-backed rate limiter and its `rate_limit` model. The final schema includes that table. Fastify overwrites `x-auth-client-ip` with its computed `request.ip`; Better Auth reads only that header for the client IP. `TRUSTED_PROXY_IPS` controls which network peers may supply forwarded client addresses. A caller cannot select its own rate-limit address by sending `x-auth-client-ip`.

The Fastify body limit is 7 MiB so a base64-encoded image can reach the plugin's 5 MiB decoded-image limit. Image validation remains separate from the HTTP body limit.

## Email contract

All authentication mail uses the official `createEmailSender` from `@better-auth/infra`. Transactional email requires a Better Auth Infrastructure **Pro or higher** plan. There is no Mailtrap, console, or alternate-provider fallback. See the [official Email Service requirements](https://better-auth.com/docs/infrastructure/services/email).

| Flow                 | Template         | Destination                                                                |
| -------------------- | ---------------- | -------------------------------------------------------------------------- |
| Verify account       | `verify-email`   | Account email.                                                             |
| Reset password       | `reset-password` | Account email; callback comes from the validated reset request.            |
| Confirm email change | `change-email`   | Current email, before the new email is verified through the official flow. |
| Invite member        | `invitation`     | Invitation email.                                                          |

Invitation links use `/accept-invitation/{id}` on the accepted request Origin. Requests without that Origin use `APP_URL`. Every consumer implements the same path contract; no app registry is involved.

The standalone server supplies `@vercel/functions` `waitUntil` to Better Auth's background task handler. Vercel can extend the invocation for these tasks; local development keeps the server process running. A `success: false` email result throws. An accepted reset request does not prove that mail reached an inbox. Production delivery, background failure reporting, and mailbox verification remain deployment checks.

## Client contract

`createAuthClient({ baseURL, basePath })` from `@notion-kit/auth/client` creates the React client. Browser code must use this client entry; the root entry contains the server factory. `basePath` defaults to `/api/auth`. The former string argument is removed.

`AuthProvider` from `@notion-kit/auth-ui` accepts `authURL`, `appURL`, `resetPasswordURL`, and `billingReturnURL`. Reset and billing URLs belong to the consumer app and must use an allowed origin. An absent reset URL makes reset submission fail explicitly. An absent billing return URL leaves the billing adapter unavailable.

Accounts and organizations are shared across configured consumer apps. `activeOrganizationId` belongs to a session, so another app or tab can change it. Organization operations use an explicit `organizationId` where the official endpoint accepts one.

CORS and trusted origins do not override browser cookie rules. The current factory does not enable cross-subdomain cookie sharing or implement a general cross-domain SSO flow. Unrelated domains need browser validation and may require a consumer-origin HTTP proxy with verified callback, cookie, and passkey settings. Such a proxy forwards requests to this service; it does not create another auth implementation. See [Better Auth cookies](https://better-auth.com/docs/concepts/cookies).

## Settings extensions

Official APIs own accounts, sessions, organization membership, team membership, invitations, subscriptions, and billing portal navigation. The retained endpoints provide data the settings panel still needs:

- `organization-extra/get-workspace-detail` joins organization identity, caller roles, and active subscription plan. Missing membership is forbidden. The explicit `billingEnabled` flag skips subscription access when disabled. Subscription failures propagate when enabled.
- `organization-extra/list-teams-with-members` returns team display fields and all member roles in one database query after membership authorization.
- `organization-extra/list-invitations-with-inviter` preserves inviter display data even after the inviter leaves the organization.
- `organization-extra/update-team-member` changes only the product `owner` or `member` role. It requires organization membership, official `team:update` permission, and valid target memberships.
- `stripe-extra` retains authorized customer display data and embedded billing address and email updates.
- Emoji endpoints retain organization authorization. Image uploads require an explicit `avatar` or `workspace-icon` purpose and validate image types and sizes. Avatar paths use the authenticated user ID and require no active organization; workspace icons require organization update permission. The client updates only the corresponding user image or organization logo.

`teamMember.role` defaults to `member` and is not client input. Official membership APIs retain control of membership keys and counts. A teamspace owner role does not grant organization administrator permissions. The UI accepts official comma-separated organization roles and derives the supported display role.

The former metadata inviteToken and resetLink flow had no accepting server endpoint and is removed. The production adapter supplies no generic invite link, so the panel hides that control. Official email invitations remain available.

Session IP and user agent use official fields. The UI derives device labels from the user agent. The previous IP-to-city HTTP lookup and stored location fields are removed; device rows show the available IP address instead of a city. This is a product tradeoff, not an official geolocation replacement.

## Schema contract

The upgrade targets empty databases and updates the final schema directly. It does not include a data migration, baseline, backfill, or remote database operation.

`src/schema-auth.ts` is the generator entrypoint with isolated placeholders and all schema-producing plugins enabled. `pnpm -F @notion-kit/auth generate` writes the generated schema. The final schema must also preserve product fields, the emoji table, and its relations; generation output requires review rather than blind replacement. No `db:push` operation is part of this upgrade.

The [shared auth service decision](../../docs/adr/0008-shared-auth-service-and-official-better-auth-features.md) explains the architecture, retained extensions, and test responsibilities. External integration checks are in [deployment verification](../../apps/auth-server/README.md#verify-a-deployment).
