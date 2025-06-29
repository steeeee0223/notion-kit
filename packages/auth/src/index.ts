export * from "./auth";
export * from "./client";
export * from "./env";

export { APIError as AuthError } from "better-auth/api";
/** For Nextjs Server */
export { toNextJsHandler } from "better-auth/next-js";
