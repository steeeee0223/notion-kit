export * from "./auth";
export * from "./client";
export * from "./env";
export type * from "./types";

export { APIError as AuthError } from "better-auth/api";
/** For Nextjs Server */
export { toNextJsHandler } from "better-auth/next-js";
