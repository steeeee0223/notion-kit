import type { ColumnDefs, Row } from "@/lib/types";

import type { LocationValue } from "./location";
import type { PropertyReference } from "./references";

export interface RelatedDatabase {
  id: string;
  name: string;
  properties: ColumnDefs;
  rows: readonly Row[];
  getRowUrl?: (rowId: string) => string;
}

export interface RelationChange {
  sourceDatabaseId: string;
  sourcePropertyId: string;
  targetDatabaseId: string;
  targetPropertyId: string;
  sourceRowId: string;
  previousRowIds: readonly string[];
  nextRowIds: readonly string[];
}

export interface TablePropertySources {
  databaseId?: string;
  databaseName?: string;
  people?: readonly PropertyReference[];
  currentActor?: PropertyReference;
  databases?: readonly RelatedDatabase[];
  /** Reserve and persist a sequence number for controlled/shared databases. */
  allocateRowNumber?: (rowId: string, minimum: number) => number;
  /** Commit the reciprocal column in the target database and return its stable ID. */
  createReciprocalRelation?: (options: {
    sourceDatabaseId: string;
    sourcePropertyId: string;
    targetDatabaseId: string;
    name: string;
  }) => string;
  createRelatedRow?: (databaseId: string, title: string) => PropertyReference;
  renameReciprocalRelation?: (
    databaseId: string,
    propertyId: string,
    name: string,
  ) => void;
  removeReciprocalRelation?: (databaseId: string, propertyId: string) => void;
  /** Commit reverse references for a batch of accepted source changes. */
  onRelationChanges?: (changes: RelationChange[]) => void;
  searchLocations?: (
    query: string,
    signal: AbortSignal,
  ) => Promise<readonly LocationValue[]>;
  reverseGeocode?: (
    coordinates: NonNullable<LocationValue["coordinates"]>,
    signal: AbortSignal,
  ) => Promise<LocationValue | null>;
}
