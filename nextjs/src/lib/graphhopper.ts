// The only code that talks to GraphHopper over HTTP. It builds the request URL
// (including the API key) and returns GraphHopper's JSON as typed objects.
// Isolating it here means the route service never deals with URLs or keys.
// "server-only" makes the build fail if browser code ever imports this file,
// which would leak the API key into the JavaScript sent to the browser.
import "server-only";

const BASE_URL = "https://graphhopper.com/api/1";

// Mirror of the JSON that GraphHopper's /route endpoint sends back, reduced to
// the fields we read. Kept separate from our own types in types.ts so a change
// on GraphHopper's side only touches this file.
export interface GraphHopperRouteResponse {
  paths: GraphHopperPath[];
}

// One candidate route. distance is in metres, time in milliseconds.
export interface GraphHopperPath {
  distance: number;
  time: number;
  // GeoJSON LineString: each coordinate is [longitude, latitude] (note the order).
  // Only returned in this shape because we ask for points_encoded=false.
  points: { type: string; coordinates: [number, number][] };
}

// Thrown when GraphHopper refuses a request (bad key, unsupported profile,
// point off the map...). Carries GraphHopper's own message for the rider.
export class GraphHopperError extends Error {}

export async function fetchRoute(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  vehicleProfile: string,
): Promise<GraphHopperRouteResponse> {
  const params = new URLSearchParams([
    ["point", `${fromLat},${fromLon}`],
    ["point", `${toLat},${toLon}`],
    ["profile", vehicleProfile],
    ["points_encoded", "false"], // plain [lon, lat] arrays instead of a compressed string
    ["instructions", "false"], // we don't show turn-by-turn directions
    ["key", process.env.GRAPHHOPPER_API_KEY ?? ""],
  ]);
  const response = await fetch(`${BASE_URL}/route?${params}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
    throw new GraphHopperError(
      typeof body?.message === "string" ? body.message : `GraphHopper returned HTTP ${response.status}`,
    );
  }
  return (await response.json()) as GraphHopperRouteResponse;
}
