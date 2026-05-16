import type { FastifyReply } from "fastify";
import * as z from "zod/v4";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  if (error instanceof z.ZodError) {
    return reply.status(422).send({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: z.treeifyError(error),
      },
    });
  }

  reply.log.error(error);
  return reply.status(500).send({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
    },
  });
}

export function notFound(message: string, details?: unknown) {
  return new ApiError(404, "NOT_FOUND", message, details);
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Unauthorized") {
  return new ApiError(401, "UNAUTHORIZED", message);
}

export function upstreamError(message: string, details?: unknown) {
  return new ApiError(502, "UPSTREAM_ERROR", message, details);
}
