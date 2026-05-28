export type MapServerTransportProviderId = "transitland" | "simulator";

export function isMapServerTransportProvider(
  value: string,
): value is MapServerTransportProviderId {
  return value === "transitland" || value === "simulator";
}

export function transportProviderPath(
  provider: MapServerTransportProviderId,
  path: `/${string}`,
) {
  return `/api/transport/${provider}${path}`;
}

export function adminTransportProviderPath(
  provider: MapServerTransportProviderId,
  path: `/${string}`,
) {
  return `/api/admin/transport/${provider}${path}`;
}
