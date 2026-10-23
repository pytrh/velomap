// What GET /api/route returns to the browser: the route geometry, its length in
// metres and the estimated riding time in seconds. This is our own contract
// with the frontend, deliberately independent of GraphHopper's JSON.
package fr.josephsong.velomap.route;

import java.util.List;

public record RouteResponse(List<RoutePoint> points, double distanceMeters, long durationSeconds) {
}
