// The business logic: picks the GraphHopper profile for the chosen bike, asks
// the client for a route, and converts GraphHopper's answer into our own
// RouteResponse (and into GPX for the download). The route handlers in
// src/app/api stay thin; the logic lives here.
import "server-only";
import { toGpx } from "./gpx";
import { fetchRoute } from "./graphhopper";
import type { BikeProfile, RouteRequest, RouteResponse } from "./types";

export async function computeRoute({ from, to, profile }: RouteRequest): Promise<RouteResponse> {
  const response = await fetchRoute(from.lat, from.lon, to.lat, to.lon, toGraphHopperProfile(profile));
  // GraphHopper can return alternatives; the first path is the best one.
  const path = response.paths[0];
  return {
    points: path.points.coordinates.map(([lon, lat]) => ({ lat, lon })), // [lon, lat] -> {lat, lon}
    distanceMeters: path.distance,
    durationSeconds: Math.floor(path.time / 1000),
  };
}

export async function computeGpx(request: RouteRequest): Promise<string> {
  const route = await computeRoute(request);
  return toGpx(route, `Velomap ${request.profile.toLowerCase()} route`);
}

// TODO custom models (needs self-hosted GraphHopper or a paid plan):
// ROAD      — avoid cobbles and rough surfaces, tolerate steep gradients and
//             twisty roads
// TRIATHLON — as ROAD, plus penalise turns and junction density (aero position
//             handles badly) and cap gradient harder (hard to climb out of the
//             saddle on aerobars)
// MOUNTAIN  — no surface penalty, prefer tracks and paths
function toGraphHopperProfile(profile: BikeProfile): string {
  switch (profile) {
    case "ROAD":
    case "TRIATHLON":
      return "bike";
    case "MOUNTAIN":
      return "mtb";
  }
}
