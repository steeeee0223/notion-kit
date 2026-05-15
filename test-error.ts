import { notFound } from "./apps/map-server/src/lib/api-error";
try {
  throw notFound("Test");
} catch (error) {
  console.log("statusCode in error:", error && typeof error === "object" && "statusCode" in error);
  console.log("error.statusCode:", (error as any).statusCode);
}
