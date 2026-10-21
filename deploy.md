# Vercel Services Deployment

This repository deploys multiple apps from one Vercel project using Vercel Services. The root `vercel.json` owns the public route map, and each service keeps its own build/runtime configuration.

## Service Routes

| Route | Service | Entrypoint | Framework |
| --- | --- | --- | --- |
| `/` | Docs | `apps/docs` | Next.js |
| `/storybook` | Storybook | `apps/storybook` | Storybook |
| `/api/auth` | Auth server | `apps/auth-server` | Fastify |
| `/example/table` | Notion table example | `examples/notion-table` | Next.js |
| `/v` | Notion clone viewer | `examples/notion-clone` | Next.js |

Vercel Services route matching uses the longest matching `routePrefix`. The docs service is mounted at `/`, so more specific prefixes such as `/api/auth`, `/storybook`, `/example/table`, and `/v` must remain explicitly registered in `vercel.json`.

Backend services receive the full prefixed request path. The auth service is mounted at `/api/auth`, and its Fastify app handles routes under `/api/auth/*`.

## Frontend Base Paths

Next.js services mounted below `/` need matching `basePath` values:

- `examples/notion-table`: `basePath: "/example/table"`
- `examples/notion-clone`: `basePath: "/v"`

The docs app is mounted at `/` and does not use a `basePath`.

## Auth Service

`apps/auth-server` is the shared Better Auth backend. It keeps the package name `@notion-kit/auth-server` and runs as a Fastify service.

Public routes:

- Health check: `/api/auth/health`
- OpenAPI reference: `/api/auth/reference`
- Better Auth API: `/api/auth/*`

Local commands:

```sh
pnpm --filter @notion-kit/auth-server dev
pnpm --filter @notion-kit/auth-server build
pnpm --filter @notion-kit/auth-server start
```

The service listens on `PORT` when provided. In local direct-dev mode, it defaults to port `3001`.

## Auth URLs

Browser clients should call the auth API through the public service path:

```sh
NEXT_PUBLIC_AUTH_URL=/api/auth
```

For local direct-dev, use the auth server port:

```sh
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth
```

Better Auth uses dynamic `baseURL` host resolution. Configure auth host allowlisting separately from browser trusted origins:

```sh
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_ALLOWED_HOSTS=*.vercel.app,localhost:*
TRUSTED_ORIGINS=
APP_URL=http://localhost:3002/v
```

- `BETTER_AUTH_URL` is the fallback auth origin.
- `BETTER_AUTH_ALLOWED_HOSTS` controls which request hosts may be used for dynamic Better Auth base URL resolution.
- `TRUSTED_ORIGINS` is only for additional frontend origins that are not already covered by the auth host handling.
- `APP_URL` is the frontend URL used when the auth server generates app-facing links such as invitations.

## Local Development

For direct local development, run services on their package ports:

```sh
pnpm --filter @notion-kit/auth-server dev
pnpm --filter @notion-kit/notion-clone dev
```

Useful direct-dev URLs:

- Auth health: `http://localhost:3001/api/auth/health`
- Auth reference: `http://localhost:3001/api/auth/reference`
- Notion clone viewer: `http://localhost:3002/v`

When running through Vercel's local Services router, use the public paths instead:

- `/`
- `/api/docs-search`
- `/api/auth/health`
- `/api/auth/reference`
- `/example/table`
- `/v`
- `/storybook`

## Docs Search

Docs search is served from:

```txt
/api/docs-search
```

The old `/api/search` route is not used.

## Deployment Checks

Before deploying, verify the shared packages and affected services:

```sh
pnpm --filter @notion-kit/auth typecheck
pnpm --filter @notion-kit/auth build
pnpm --filter @notion-kit/auth-server typecheck
pnpm --filter @notion-kit/auth-server build
pnpm --filter @notion-kit/docs build
pnpm --filter @notion-kit/notion-table build
pnpm --filter @notion-kit/notion-clone build
```

After deployment, smoke-test:

- `/` loads the docs home page.
- `/api/docs-search` responds for docs search.
- `/api/auth/health` returns a healthy JSON response.
- `/api/auth/reference` loads the Better Auth OpenAPI reference.
- `/example/table` loads the table example.
- `/v` loads the Notion clone viewer.
- `/storybook` routes to the Storybook service.

## Reserved Paths

- `/api/auth` is reserved for the shared auth service.
- `/api/docs-search` is reserved for docs search.
- Future backend services should use `/api/<service-name>`.
- `/v` is reserved for the Notion clone viewer.
- `/example/table` is reserved for the table example.
