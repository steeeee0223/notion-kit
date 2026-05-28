import type { FastifyInstance, FastifyRequest } from "fastify";

import { sendError, unauthorized, upstreamError } from "@/lib/api-error";
import { openApi } from "@/openapi";
import {
  getActiveConfig,
  getConfigForAdminToken,
  patchCredential,
  redactCredentials,
  upsertCredentials,
} from "@/services/config";

import {
  configAdminTokenParamsSchema,
  patchCredentialsBodySchema,
  upsertCredentialsBodySchema,
} from "./schema";

export function registerAdminConfigRoutes(app: FastifyInstance) {
  app.get(
    "/api/admin/config",
    { schema: openApi.adminConfig },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const row = await getActiveConfig(app.env.MAP_ADMIN_TOKEN);
        return reply.send({
          admin_token: row.adminToken,
          credentials: redactCredentials(row.credentials),
        });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/admin/config/:adminToken",
    { schema: openApi.adminConfigByToken },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const params = configAdminTokenParamsSchema.parse(request.params);
        const row = await getConfigForAdminToken(params.adminToken);
        return reply.send({
          admin_token: row.adminToken,
          credentials: redactCredentials(row.credentials),
        });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.put(
    "/api/admin/config/:adminToken/credentials",
    { schema: openApi.adminConfigCredentialsPut },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const params = configAdminTokenParamsSchema.parse(request.params);
        const body = upsertCredentialsBodySchema.parse(request.body ?? {});
        const row = await upsertCredentials(
          params.adminToken,
          body.credentials,
        );
        assertConfigRow(row);
        return reply.send({
          admin_token: row.adminToken,
          credentials: redactCredentials(row.credentials),
        });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.patch(
    "/api/admin/config/:adminToken/credentials",
    { schema: openApi.adminConfigCredentialsPatch },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const params = configAdminTokenParamsSchema.parse(request.params);
        const body = patchCredentialsBodySchema.parse(request.body ?? {});
        const row = await patchCredential(
          params.adminToken,
          body.key,
          body.value,
        );
        assertConfigRow(row);
        return reply.send({
          admin_token: row.adminToken,
          credentials: redactCredentials(row.credentials),
        });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}

function assertAdmin(app: FastifyInstance, request: FastifyRequest) {
  if (!app.env.MAP_ADMIN_TOKEN) return;
  const header = request.headers.authorization;
  if (header !== `Bearer ${app.env.MAP_ADMIN_TOKEN}`) {
    throw unauthorized();
  }
}

function assertConfigRow<T>(row: T | undefined): asserts row is T {
  if (!row) throw upstreamError("Config update did not return a row");
}
