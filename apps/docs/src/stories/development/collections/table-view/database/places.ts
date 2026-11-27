import { z } from "zod";

import type { TablePropertySources } from "@notion-kit/table-hook";
import { locationValueSchema } from "@notion-kit/table-hook/plugins";

const photonUrl = "https://photon.komoot.io";
const responseSchema = z.object({ features: z.array(z.unknown()) });
const featureSchema = z.object({
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: z.object({
    name: z.string().optional(),
    housenumber: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }),
});

async function fetchPlaces(
  path: "/api/" | "/reverse/",
  parameters: Record<string, string>,
  signal: AbortSignal,
) {
  const url = new URL(path, photonUrl);
  url.search = new URLSearchParams(parameters).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Place lookup failed (${response.status})`);

  const { features } = responseSchema.parse(await response.json());
  return features.flatMap((feature) => {
    const parsed = featureSchema.safeParse(feature);
    if (!parsed.success) return [];

    const { geometry, properties } = parsed.data;
    const [longitude, latitude] = geometry.coordinates;
    const { name, housenumber, street, city, state, country } = properties;
    const streetAddress = [housenumber, street].filter(Boolean).join(" ");
    const address = [
      ...new Set([streetAddress, city, state, country].filter(Boolean)),
    ].join(", ");
    const place = locationValueSchema.safeParse({
      name: name ?? "",
      address,
      coordinates: { latitude, longitude },
    });
    return place.success ? [place.data] : [];
  });
}

export const placeSources = {
  searchLocations: (query, signal) =>
    fetchPlaces("/api/", { q: query, limit: "7" }, signal),
  reverseGeocode: async ({ latitude, longitude }, signal) => {
    const [place] = await fetchPlaces(
      "/reverse/",
      { lat: String(latitude), lon: String(longitude), limit: "1" },
      signal,
    );
    return place ?? null;
  },
} satisfies Pick<TablePropertySources, "searchLocations" | "reverseGeocode">;
