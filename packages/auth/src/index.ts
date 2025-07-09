export * from "./auth";
export * from "./client";
export * from "./env";
export { getAccountName } from "./db";

export type { ErrorContext } from "better-auth/react";
export { APIError as AuthError } from "better-auth/api";
/** For Nextjs Server */
export { toNextJsHandler } from "better-auth/next-js";
