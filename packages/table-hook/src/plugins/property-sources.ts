import type { PropertyReference } from "@/lib/property-reference";

import type { LocationValue } from "./location";

export interface TablePropertySources {
  databaseName?: string;
  people?: readonly PropertyReference[];
  currentActor?: PropertyReference;
  /** Reserve and persist a sequence number for controlled/shared databases. */
  allocateRowNumber?: (rowId: string, minimum: number) => number;
  searchLocations?: (
    query: string,
    signal: AbortSignal,
  ) => Promise<readonly LocationValue[]>;
  reverseGeocode?: (
    coordinates: NonNullable<LocationValue["coordinates"]>,
    signal: AbortSignal,
  ) => Promise<LocationValue | null>;
}
