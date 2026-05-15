import { createFetch } from "@better-fetch/fetch";

import { env } from "@/env";

const BASE_URL = "https://futar.bkk.hu/api/query/v1/ws/otp/api/where";

export const bkkClient = createFetch({
  baseURL: BASE_URL,
  customFetchImpl: fetch,
});

export async function fetchBKK<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  headers?: Record<string, string>,
) {
  const query = {
    key: env.TRANS_FUTAR_OPEN_DATA,
    version: "4",
    appVersion: "1.0.0",
    ...params,
  };

  const { data, error } = await bkkClient<T>(endpoint, {
    query,
    headers,
  });

  if (error) {
    // 304 Not Modified will also fall into error? Wait, fetch might not treat 304 as error, but better-fetch could if ok is false.
    // Let's assume better-fetch handles 304 gracefully, but wait, `better-fetch` throws errors for non-2xx unless specified.
    // 304 is often used for polling vehicles.
    if (error.status === 304) {
      return null;
    }
    throw new Error(error.statusText || `FUTAR API Error: ${error.status}`);
  }

  return data;
}
