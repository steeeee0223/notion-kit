export interface VehiclePosition {
  id: string;
  routeId: string;
  routeShortName: string;
  routeColor: string;
  operatorOnestopId?: string;
  vehicleType:
    | "BUS"
    | "TRAM"
    | "TROLLEYBUS"
    | "SUBWAY"
    | "RAIL"
    | "FERRY"
    | "UNKNOWN";
  longitude: number;
  latitude: number;
  bearing: number;
  label: string;
  licensePlate: string;
  lastUpdateTime: number; // epoch milliseconds
  stale: boolean;
}

export interface RouteShape {
  shapeId: string;
  routeId: string;
  points: [lng: number, lat: number][];
}
