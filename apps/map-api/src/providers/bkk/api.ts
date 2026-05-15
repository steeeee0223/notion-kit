export interface TransitCoordinatePoint {
  lat: number;
  lon: number;
}

export interface TransitVehicle {
  vehicleId: string;
  routeId?: string;
  stopId?: string;
  tripId?: string;
  location?: TransitCoordinatePoint;
  bearing?: number;
  label?: string;
  licensePlate?: string;
  lastUpdateTime?: number;
  stale?: boolean;
  deviated: boolean;
  vehicleRouteType?: string;
  status?: "INCOMING_AT" | "STOPPED_AT" | "IN_TRANSIT_TO";
  stopSequence?: number;
  stopDistancePercent?: number;
  model?: string;
  wheelchairAccessible: boolean;
}

export interface TransitRoute {
  id: string;
  agencyId: string;
  shortName?: string;
  longName?: string;
  description?: string;
  type: string;
  color?: string;
  textColor?: string;
  sortOrder?: number;
  bikesAllowed?: boolean;
}

export interface TransitReferences {
  routes?: Record<string, TransitRoute>;
  agencies?: Record<string, unknown>;
  stops?: Record<string, unknown>;
  trips?: Record<string, unknown>;
  alerts?: Record<string, unknown>;
}

export interface TransitListEntryWithReferencesTransitVehicle {
  list: TransitVehicle[];
  references?: TransitReferences;
  outOfRange: boolean;
  limitExceeded: boolean;
}

export interface VehiclesForLocationMethodResponse {
  code: number;
  currentTime: number;
  data: TransitListEntryWithReferencesTransitVehicle;
  status: string;
  text: string;
  version: number;
}

export interface TransitPolyline {
  length: number;
  levels: string;
  points: string;
}

export interface TransitRouteVariant {
  headsign?: string;
  name?: string;
  direction?: string;
  patternId?: string;
  routeId?: string;
  polyline: TransitPolyline;
  stopIds: string[];
}

export interface TransitRouteDetails {
  id: string;
  shortName?: string;
  longName?: string;
  color?: string;
  textColor?: string;
  type: string;
  variants?: TransitRouteVariant[];
}

export interface RouteDetailsMethodResponse {
  code: number;
  currentTime: number;
  data: {
    entry: TransitRouteDetails;
    references?: TransitReferences;
  };
  status: string;
  text: string;
  version: number;
}
