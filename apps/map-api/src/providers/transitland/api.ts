export interface TransitlandAgency {
  agency_id: string;
  agency_name: string;
  geometry?: {
    coordinates: number[][][];
    type: string;
  };
  id: number;
  onestop_id: string;
}

export interface TransitlandOperator {
  agencies: TransitlandAgency[];
  id: number;
  name: string;
  onestop_id: string;
  short_name: string | null;
  website: string;
  feeds?: TransitlandFeed[];
}

export interface TransitlandOperatorsResponse {
  meta: {
    after: number;
    next: string;
  };
  operators: TransitlandOperator[];
}

export interface TransitlandRoute {
  id: number;
  onestop_id: string;
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc: string | null;
  route_type: number;
  route_color: string | null;
  route_text_color: string | null;
  route_url: string | null;
  agency: {
    agency_id: string;
    agency_name: string;
    id: number;
    onestop_id: string;
  };
  geometry?: {
    coordinates: number[][] | number[][][];
    type: string;
  };
}

export interface TransitlandRoutesResponse {
  meta: {
    after: number;
    next: string;
  };
  routes: TransitlandRoute[];
}

export interface TransitlandFeed {
  id: number;
  onestop_id: string;
  spec: string;
  name: string | null;
}

export interface TransitlandFeedsResponse {
  meta: {
    after: number;
    next: string;
  };
  feeds: TransitlandFeed[];
}

export interface TransitlandStop {
  id: number;
  onestop_id: string;
  stop_id: string;
  stop_name: string;
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  location_type: number;
  route_stops?: {
    route: {
      id: number;
      route_short_name: string;
      route_long_name: string;
      route_type: number;
      route_color: string | null;
    };
  }[];
}

export interface TransitlandStopsResponse {
  meta: {
    after: number;
    next: string;
  };
  stops: TransitlandStop[];
}

export interface TransitlandDeparture {
  trip: {
    trip_id: string;
    trip_headsign: string;
    direction_id: number;
    route: {
      id: number;
      route_id: string;
      route_short_name: string;
      route_long_name: string;
      route_type: number;
      route_color: string | null;
    };
  };
  stop_headsign: string | null;
  arrival: { scheduled: string | null; estimated: string | null };
  departure: { scheduled: string | null; estimated: string | null };
  service_date: string;
  continuous_drop_off: number | null;
  continuous_pickup: number | null;
}

export interface TransitlandDeparturesResponse {
  stops: {
    id: number;
    onestop_id: string;
    stop_id: string;
    stop_name: string;
    departures: TransitlandDeparture[];
  }[];
}

export interface TransitlandRoutesGeoJSONResponse {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: {
      type: string;
      coordinates: number[][] | number[][][];
    };
    properties: {
      id: number;
      onestop_id: string;
      route_id: string;
      route_short_name: string;
      route_long_name: string;
      route_type: number;
      route_color: string | null;
      route_text_color: string | null;
      agency: {
        agency_name: string;
        onestop_id: string;
      };
    };
  }[];
}
