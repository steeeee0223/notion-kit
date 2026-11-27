# @notion-kit/auth

The [shared auth server](../../apps/auth-server/README.md) uses this package to configure Better Auth and serve account and organization data. Consumer apps use the browser entry point `@notion-kit/auth/client`.

## Versions

Better Auth, the `auth` CLI, `@better-auth/passkey`, and `@better-auth/stripe` are at 1.7.28. The email integration uses `@better-auth/infra` 0.4.31. The workspace uses Better Fetch 1.3.3 and Stripe Node SDK 23.2.0.

Stripe SDK requests default to `2026-11-18.endive`. The Stripe Dashboard sets the event version for each webhook destination. Check both versions independently before deploying. [Stripe API upgrades](https://docs.stripe.com/upgrades)

## Server configuration

`createAuthEnv()` reads and validates the server environment. `createAuth(env, options)` takes the resulting `AuthEnv` value. Each auth instance uses its own database connection, secret, public URL, storage client, and email sender.

| Variable                                     | Requirement                                    | Meaning                                                                                                       |
| -------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_URL`                               | Required                                       | PostgreSQL connection string.                                                                                 |
| `BETTER_AUTH_URL`                            | Required URL                                   | Public base URL of the auth service.                                                                          |
| `BETTER_AUTH_SECRET`                         | At least 32 characters                         | Signing and encryption secret.                                                                                |
| `APP_URL`                                    | Optional URL                                   | Default consumer URL for invitation links. Defaults to `BETTER_AUTH_URL`.                                     |
| `TRUSTED_ORIGINS`                            | Optional comma-separated URLs                  | Additional consumer origins. Better Auth trusts the origins of `APP_URL` and `BETTER_AUTH_URL` automatically. |
| `TRUSTED_PROXY_IPS`                          | Optional comma-separated IP addresses or CIDRs | Peers whose forwarded client addresses Fastify trusts. Omit for direct connections.                           |
| `PASSKEY_RP_ID`                              | Optional hostname                              | Passkey relying-party ID.                                                                                     |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`   | Required                                       | Google OAuth credentials.                                                                                     |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`   | Required                                       | GitHub OAuth credentials.                                                                                     |
| `BETTER_AUTH_API_KEY`                        | Required                                       | Server-only Better Auth Infrastructure key.                                                                   |
| `BETTER_AUTH_API_URL`                        | Optional URL                                   | Better Auth Infrastructure API endpoint override.                                                             |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Optional pair                                  | Set both to enable Stripe subscriptions and customer endpoints.                                               |
| `STRIPE_PLANS`                               | Optional JSON array                            | Paid plans for organizations. Defaults to an empty array.                                                     |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`   | Optional pair                                  | Set both to enable emoji and image storage.                                                                   |
| `NODE_ENV`                                   | Optional                                       | `development`, `production`, or `test`. Defaults to `development`.                                            |

A paid plan has a `name`, a Stripe `priceId`, and an optional `annualDiscountPriceId`. The shared service recognizes `education`, `plus`, `business`, and `enterprise` across apps. The free plan needs no Stripe price.

`options.basePath` sets the API prefix and defaults to `/api/auth`. The Fastify server mounts `/api/auth/*`. A different prefix needs matching HTTP routes. `options.backgroundTasks` supplies Better Auth's background task handler.

Better Auth stores rate limits in the `rate_limit` table and reads the client IP from `x-auth-client-ip`. Fastify replaces that header with `request.ip` and accepts forwarded addresses only from peers in `TRUSTED_PROXY_IPS`. The HTTP body limit is 7 MiB to accommodate base64 encoding. Upload validation caps the decoded image at 5 MiB.

## Email delivery

`createEmailSender` from `@better-auth/infra` sends all authentication emails. Transactional email requires a Better Auth Infrastructure Pro plan or higher. [Email Service requirements](https://better-auth.com/docs/infrastructure/services/email)

| Flow                 | Template         | Recipient                                                                |
| -------------------- | ---------------- | ------------------------------------------------------------------------ |
| Verify account       | `verify-email`   | The account email address.                                               |
| Reset password       | `reset-password` | The account email address. Better Auth validates the requested callback. |
| Confirm email change | `change-email`   | The current email address. Better Auth then verifies the new one.        |
| Invite member        | `invitation`     | The invitee.                                                             |

The service builds invitation links at `/accept-invitation/{id}` using the trusted request origin. It uses `APP_URL` when the request has no trusted origin. Each consumer implements that route.

The Fastify server passes Vercel's `waitUntil` to Better Auth so background tasks can continue after the response. Local development keeps the server process running. The sender throws when the email API returns `success: false`. Verify actual delivery through the [deployment checks](../../apps/auth-server/README.md#verify-a-deployment).

## Browser client

`createAuthClient({ baseURL, basePath })` from `@notion-kit/auth/client` creates the React client. `basePath` defaults to `/api/auth`. The options object replaces the previous string argument. The root package export contains the server factory.

`AuthProvider` from `@notion-kit/auth-ui` accepts `authURL`, `appURL`, `resetPasswordURL`, and `billingReturnURL`. The consumer owns the reset page and billing return page. Their URLs must use an allowed origin. A reset request without `resetPasswordURL` fails with a configuration error. Omitting `billingReturnURL` disables the billing adapter.

Configured apps share accounts and organizations. Another tab or app can change the session's `activeOrganizationId`. Pass the intended `organizationId` when an endpoint accepts one.

The factory uses the default Better Auth cookie scope. Browser cookie rules still apply to trusted origins. An app on a separate domain may need a same-origin proxy to the shared service. Test callbacks, cookies, and passkeys on the deployed domains. [Better Auth cookies](https://better-auth.com/docs/concepts/cookies)

## Settings endpoints

The settings panel uses Better Auth APIs for accounts, sessions, organization and team membership, invitations, subscriptions, and billing portal links. It also uses these product endpoints.

- `organization-extra/get-workspace-detail` returns the organization, the caller's roles, and the current plan. It requires membership. It reads subscriptions when billing is enabled and returns an error if that read fails.
- `organization-extra/list-teams-with-members` checks organization membership, then reads team display fields and member roles in one query.
- `organization-extra/list-invitations-with-inviter` keeps the inviter's display data available after the inviter leaves the organization.
- `organization-extra/update-team-member` sets a team member's role to `owner` or `member`. It checks the caller's organization membership and `team:update` permission, then verifies the target's organization and team membership.
- `stripe-extra` checks permission to read a Stripe customer or update the customer's billing email and address in the settings panel.
- Emoji endpoints check organization access. Image uploads validate the image type and size and require a purpose. The `avatar` purpose uses the signed-in user's ID. The `workspace-icon` purpose uses the organization ID and requires organization update permission. The client updates the account image or organization logo for the requested purpose.

The server assigns `teamMember.role`, which defaults to `member`. Better Auth controls membership keys and counts. The UI derives a display role from the comma-separated organization roles. Team ownership grants team permissions. Organization permissions come from organization roles.

The panel uses email invitations and hides the generic invite-link control. Device rows show the session IP when available and derive the device label from the user agent.

## Database schema

This upgrade targets empty databases and updates `src/db/schemas.ts`. The schema change is limited to the repository. Work on an existing database requires a separate migration.

`pnpm -F @notion-kit/auth generate` runs `src/schema-auth.ts` with placeholder credentials and all plugins that define tables. Review the generated schema for the product fields, the emoji table, and its relations before accepting the result.

The architecture and its tradeoffs are in the [shared auth service decision](../../docs/adr/0008-shared-auth-service-and-official-better-auth-features.md).
