import type { FastifyInstance, FastifyRequest } from "fastify";

import { sendError, unauthorized, upstreamError } from "@/lib/api-error";
import {
  getActiveConfig,
  getConfigForUser,
  patchCredential,
  redactCredentials,
  upsertCredentials,
} from "@/services/config";

import {
  configUserParamsSchema,
  patchCredentialsBodySchema,
  upsertCredentialsBodySchema,
} from "./schema";

export function registerAdminConfigRoutes(app: FastifyInstance) {
  app.get("/api/admin/config", async (request, reply) => {
    try {
      assertAdmin(app, request);
      const row = await getActiveConfig(app.env.MAP_ADMIN_TOKEN);
      return reply.send({
        user: row.user,
        credentials: redactCredentials(row.credentials),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/admin/config/:user", async (request, reply) => {
    try {
      assertAdmin(app, request);
      const params = configUserParamsSchema.parse(request.params);
      const row = await getConfigForUser(params.user);
      return reply.send({
        user: row.user,
        credentials: redactCredentials(row.credentials),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.put("/api/admin/config/:user/credentials", async (request, reply) => {
    try {
      assertAdmin(app, request);
      const params = configUserParamsSchema.parse(request.params);
      const body = upsertCredentialsBodySchema.parse(request.body ?? {});
      const row = await upsertCredentials(params.user, body.credentials);
      assertConfigRow(row);
      return reply.send({
        user: row.user,
        credentials: redactCredentials(row.credentials),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.patch("/api/admin/config/:user/credentials", async (request, reply) => {
    try {
      assertAdmin(app, request);
      const params = configUserParamsSchema.parse(request.params);
      const body = patchCredentialsBodySchema.parse(request.body ?? {});
      const row = await patchCredential(params.user, body.key, body.value);
      assertConfigRow(row);
      return reply.send({
        user: row.user,
        credentials: redactCredentials(row.credentials),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });
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
