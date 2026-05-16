import { createFetch } from "@better-fetch/fetch";

export const mapApiClient = createFetch({
  baseURL: "http://localhost:3100/api/transit",
});
