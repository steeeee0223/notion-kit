# Shared auth service and Better Auth APIs

Our apps share users and organizations. They send auth requests to one service,
which owns the database connection and credentials. `apps/auth-server` handles
HTTP. `packages/auth` configures Better Auth and implements the settings
endpoints specific to our apps. Consumers import
`@notion-kit/auth/client` to keep database and server SDK code out of browser
bundles.

Exact trusted origins identify the apps that can call the service. The app
set is small enough to configure directly. A registry or OAuth provider would
add a second set of client credentials and registration rules. Browser cookie
rules apply to each deployment. If apps on separate domains need a same-origin
proxy, the proxy forwards requests to the shared service. Cookie behavior,
callbacks, and passkeys need testing through that proxy.

Better Auth owns accounts, sessions, organization and team membership,
invitations, subscriptions, and rate limits. Creating memberships through
its APIs preserves Better Auth's control over membership keys and counts.
Using those APIs also lets us drop custom schema fields and aliases whose
only callers were the former implementations.

The settings panel needs workspace details, teams with member roles, and
invitations with inviter profiles. `organization-extra` fetches teams and
members together so the panel can make one request. It joins invitation
records directly to the inviter's user record so the panel can show the
inviter's name even after their membership ends. The custom team role update
checks `team:update` and the target's organization and team memberships.
Team roles grant permissions within a team. Organization roles govern
organization administration.

The Stripe plugin handles subscriptions and billing portal links.
`stripe-extra` keeps the settings panel's billing email and address forms
working through authorized customer reads and updates. The service owns paid
plans and price IDs for all apps. When billing is disabled, workspace details
skip the subscription query. When billing is enabled, a failed query reaches
the caller so the panel can show the failure. Each webhook destination pins
its own Stripe event version and needs a separate deployment check.

All auth mail uses Better Auth Email Service. Email change confirmation goes
to the current mailbox first. Invitation links use the requesting app's
trusted origin and the common `/accept-invitation/{id}` route, with `APP_URL`
as the default. Each consumer owns its reset page and billing return URL.
The auth response can arrive while the email task is still running. Confirm
inbox delivery in the deployment.

The device list now shows the IP address and derives its label from Better
Auth's user agent. Removing the IP-to-city lookup avoids an external call and
an extra database write during session updates. Fastify derives the IP using
its trusted proxy list. It overwrites `x-auth-client-ip` before passing the
request to Better Auth, which uses that IP for rate limiting.

An avatar upload belongs to the authenticated user. A workspace icon upload
belongs to the organization and requires organization update permission.
The server checks image data and storage paths before writing. The client
refreshes the account or workspace that owns the image. After an avatar
upload, the account refresh asks for a fresh session so the panel shows the
new avatar.

The settings panel hides unavailable controls and reports an error if a caller
attempts an unavailable update. Email invitations replace the generic invite
link, whose token had no accepting endpoint. Users with two-factor
authentication already enrolled can complete a challenge with Better Auth's
TOTP or backup-code API. Enrollment controls remain unavailable.

The upgrade targets empty databases. It updates the final schema in the
repository. The generator enables all schema-producing plugins with
placeholder credentials. Review each run for the product fields and relations
before accepting the output. A populated database will need its own migration.

Keep automated tests focused on the behavior we own. Service tests cover
authorization, data returned by the custom endpoints, image validation,
failure handling, and email routing. HTTP adapter tests exercise origin
checks, client addresses, raw webhook bytes, multiple cookies, redirects,
and status codes. UI tests check the controls and errors users see.
Type checks and the consumer build check our calls to the Better Auth APIs.
The [deployment checks](../../apps/auth-server/README.md#verify-a-deployment)
cover PostgreSQL, real email delivery, OAuth, passkeys, Stripe, Supabase, and
browser cookies. The [auth reference](../../packages/auth/README.md) lists the
configuration and settings endpoints.
