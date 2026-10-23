// The shapes of our own API: what GET /api/route returns and what the page
// sends. Imported by both the server code and the browser code, so the two can
// never disagree (in the Spring version these exist twice: once as Java
// records, once as TypeScript interfaces in Angular).
// Deliberately independent of GraphHopper's JSON, which lives in graphhopper.ts.

export const BIKE_PROFILES = ["ROAD", "TRIATHLON", "MOUNTAIN"] as const;

export type BikeProfile = (typeof BIKE_PROFILES)[number];

// Latitude first, the order Leaflet expects (GraphHopper uses the opposite).
export interface LatLon {
  lat: number;
  lon: number;
}

export interface RouteResponse {
  points: LatLon[];
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteRequest {
  from: LatLon;
  to: LatLon;
  profile: BikeProfile;
}
