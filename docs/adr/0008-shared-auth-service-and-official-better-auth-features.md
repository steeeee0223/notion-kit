# Shared auth service and official Better Auth features

Our apps use one auth service so each consumer does not maintain its own
authentication endpoints, credentials, or database configuration.
`apps/auth-server` owns the HTTP interface. `packages/auth` configures Better
Auth and provides the product extensions needed by the settings panel.
Consumers use `@notion-kit/auth/client`; the package root remains server-only
so database and server SDK dependencies do not enter browser bundles.

The service shares users and organizations across our own apps. Exact trusted
origins identify permitted consumers. An app registry or OAuth provider would
add client registration and authorization protocols that this use case does
not require. Trusted origins do not establish SSO across arbitrary domains:
browser cookie rules still apply. A deployment that needs a same-origin proxy
must verify cookie, callback, and passkey behavior while keeping auth logic in
the shared service.

Better Auth owns accounts, sessions, organization membership, team membership,
invitations, subscriptions, and rate limiting. We remove custom implementations
when the official API supplies the required behavior. We do not retain old
schema fields, compatibility aliases, or successful fallback responses to hide
an unavailable operation. Official membership APIs own membership keys and
counts; directly inserting team memberships would bypass those guarantees.

Some settings data still needs product-specific composition. The
`organization-extra` endpoints return workspace details, teams with members,
and invitations with inviter profiles. These queries retain authorization and
avoid per-team requests. Joining an invitation to its user preserves the
inviter's display data after organization membership ends. The custom team
role update changes only the product's `owner` or `member` role. It checks
official `team:update` permission and both organization and team membership.
A teamspace owner does not become an organization administrator.

Stripe subscriptions and portal navigation use the official plugin.
`stripe-extra` retains authorized customer reads and updates because the
settings panel has embedded billing email and address forms. Replacing those
endpoints with portal navigation would remove that interface. Paid plan names
and real price IDs belong to server configuration. Billing is optional;
explicitly disabling it skips subscription reads, whereas an enabled billing
failure remains an error. The Stripe Node SDK upgrade does not change a
webhook destination's event version, which requires separate deployment
verification.

All authentication mail uses the official Better Auth Email Service. There is
no alternate sender or console delivery fallback. Email-change confirmation
goes to the current mailbox. Invitation links use the accepted consumer Origin
and the common `/accept-invitation/{id}` route, with `APP_URL` as the default
when no accepted Origin is available. This supports our apps without adding a
per-app registry. Consumers own their reset-token pages and billing return
URLs. Background task acceptance does not prove email delivery.

Session IP addresses and user agents use official fields. Device labels are
derived in the UI. We removed the external IP-to-city lookup and stored
location fields to avoid a network request and an extra database write during
session updates. City display is intentionally removed; Better Auth's IP
field is not a geolocation service. Fastify computes the client address using
its configured proxy allowlist and overwrites `x-auth-client-ip` before Better
Auth uses it for rate limiting.

Emoji and image storage remain product features. Uploads distinguish `avatar`
from `workspace-icon`: an avatar uses the authenticated user's identity and
does not require an organization, while a workspace icon requires organization
update permission. Image validation and storage-path checks precede writes.
The client updates and refreshes only the corresponding account or workspace.
Account reloads request a fresh session to avoid displaying a cached avatar
after a successful upload.

Missing settings adapters disable the corresponding controls, and attempted
mutations reject instead of reporting success. We removed the generic invite
link because its token had no accepting server endpoint. Official email
invitations remain available. Existing two-factor challenges use the official
TOTP and backup-code APIs; unfinished enrollment controls remain unavailable.

The upgrade targets empty databases, so it replaces the final schema without
a legacy model, backfill, or data migration. No database operation was run as
part of the upgrade. The generator entrypoint enables every schema-producing
plugin with isolated placeholder configuration. Generated output still needs
review for product fields and relations. This decision does not authorize
replacing the schema of a future populated deployment without migration work.

Tests in `packages/auth` cover our authorization, data composition, upload
validation, failure handling, and email routing decisions. They do not repeat
official plugin method checks, Stripe signature verification, or official
membership creation. Type checking and consumer compilation check API
compatibility. `apps/auth-server` tests cover the HTTP adapter's raw body,
cookies, CORS, redirects, status codes, and proxy handling. Tests in `auth-ui`
and `settings-panel` cover user-visible state and error behavior.

Memory adapters and mocked external services do not establish deployment
readiness. The upgrade did not verify a real PostgreSQL database, email
delivery, OAuth providers, physical passkeys, Stripe, Supabase policies, or
cross-site cookies. Those checks remain part of
[deployment verification](../../apps/auth-server/README.md#verify-a-deployment).
Configuration and extension contracts are in the
[auth reference](../../packages/auth/README.md).
