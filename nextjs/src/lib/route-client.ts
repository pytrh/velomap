// All HTTP calls from the browser to our own API live here, so components never
// build URLs or talk to the network themselves (the counterpart of the Angular
// RouteService). The URLs are relative: the page and the API are served by the
// same Next.js server, so there is no other origin and no CORS to configure.
import type { RouteRequest, RouteResponse } from "./types";

export async function getRoute(request: RouteRequest): Promise<RouteResponse> {
  return (await call("/api/route", request)).json();
}

// The .gpx file comes back as raw bytes (a Blob) for the page to save.
export async function getGpx(request: RouteRequest): Promise<Blob> {
  return (await call("/api/route/gpx", request)).blob();
}

async function call(path: string, { from, to, profile }: RouteRequest): Promise<Response> {
  const params = new URLSearchParams({
    fromLat: String(from.lat),
    fromLon: String(from.lon),
    toLat: String(to.lat),
    toLon: String(to.lon),
    profile,
  });
  const response = await fetch(`${path}?${params}`);
  if (!response.ok) {
    // Our API always answers errors as {"message": "..."}; show that text.
    const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
    throw new Error(typeof body?.message === "string" ? body.message : `Request failed (HTTP ${response.status}).`);
  }
  return response;
}
