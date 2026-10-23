// Shared plumbing for the two route handlers: reads and checks the query
// parameters, and turns failures into HTTP responses. This is what Spring did
// for free with @RequestParam (400 on a bad value) and @ExceptionHandler (502
// when GraphHopper refuses); in Next.js we write it ourselves.
import "server-only";
import { GraphHopperError } from "./graphhopper";
import { BIKE_PROFILES, type BikeProfile, type RouteRequest } from "./types";

// Returns the parsed request, or a 400 Response explaining what is wrong.
export function parseRouteRequest(searchParams: URLSearchParams): RouteRequest | Response {
  const numbers: Record<string, number> = {};
  for (const name of ["fromLat", "fromLon", "toLat", "toLon"]) {
    const raw = searchParams.get(name);
    const value = raw === null || raw.trim() === "" ? NaN : Number(raw);
    if (Number.isNaN(value)) return badRequest(`Parameter '${name}' must be a number`);
    numbers[name] = value;
  }
  const profile = searchParams.get("profile");
  if (!BIKE_PROFILES.includes(profile as BikeProfile)) {
    return badRequest(`Parameter 'profile' must be one of ${BIKE_PROFILES.join(", ")}`);
  }
  return {
    from: { lat: numbers.fromLat, lon: numbers.fromLon },
    to: { lat: numbers.toLat, lon: numbers.toLon },
    profile: profile as BikeProfile,
  };
}

// GraphHopper's refusals become 502 Bad Gateway with its message, so the page
// can show the rider what went wrong. Anything else is a genuine bug: rethrow.
export function graphHopperRejected(error: unknown): Response {
  if (error instanceof GraphHopperError) {
    return Response.json({ message: error.message }, { status: 502 });
  }
  throw error;
}

function badRequest(message: string): Response {
  return Response.json({ message }, { status: 400 });
}
