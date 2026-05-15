import { createFetch } from "@better-fetch/fetch";

import { env } from "@/env";

const transitlandClient = createFetch({
  baseURL: "https://transit.land/api/v2/rest",
  customFetchImpl: fetch,
});

export async function fetchTransitland<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  headers?: Record<string, string>,
) {
  const query = {
    apikey: env.TRANS_TRANSITLAND,
    ...params,
  };

  const { data, error } = await transitlandClient<T>(endpoint, {
    query,
    headers,
  });

  if (error) {
    if (error.status === 304) {
      return null;
    }
    throw new Error(
      error.statusText || `Transitland API Error: ${error.status}`,
    );
  }

  return data;
}
