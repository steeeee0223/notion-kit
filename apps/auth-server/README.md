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
