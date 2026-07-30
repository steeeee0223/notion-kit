# @notion-kit/auth-server

Fastify service for shared Better Auth routes.

## Serve Locally

From the repository root:

```sh
pnpm -F auth-server dev
```

`start` uses the same entrypoint:

```sh
pnpm -F auth-server build
pnpm -F auth-server start
```

The service listens on `PORT` when provided, otherwise `3001`.

## Routes

- Health check: `/api/auth/health`
- OpenAPI docs: `/api/auth/reference`
- Better Auth API: `/api/auth/*`

## Deployment Health Check

The `Auth Server Deployment Health` GitHub Actions workflow checks every
ready Vercel preview and production deployment. It requires `/api/auth/health`
to return HTTP `200` and exactly this JSON object:

```json
{
  "ok": true,
  "service": "@notion-kit/auth-server"
}
```

One-time setup:

1. In the GitHub repository, set the Actions variable
   `AUTH_SERVER_VERCEL_PROJECT_NAME` to the auth-server project name in Vercel.
2. In the Vercel project's Git settings, enable repository-dispatch events.
3. If Deployment Protection applies, enable Protection Bypass for Automation
   and add its value to GitHub as the
   `VERCEL_AUTOMATION_BYPASS_SECRET` Actions secret.
4. In the Vercel production environment's Deployment Checks, require
   `Vercel - <project-name>: health (production)`.

Preview checks report against their deployment commit. Required Deployment
Checks gate production promotion, as defined by Vercel.
