import { notFound } from "./apps/map-server/src/lib/api-error";
try {
  throw notFound("Test");
} catch (error) {
  console.log({
    error,
    isObject: typeof error === "object",
    hasStatusCode: error ? "statusCode" in error : false,
    statusCode: (error as any)?.statusCode
  });
}
