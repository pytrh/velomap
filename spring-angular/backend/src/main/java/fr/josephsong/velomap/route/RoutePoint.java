// One point of the route, as sent to the browser. Latitude first, which is the
// order Leaflet expects (GraphHopper uses the opposite order; the service swaps them).
// A Java record is a compact immutable data class; Spring turns it into JSON
// like {"lat": 44.83, "lon": -0.57}.
package fr.josephsong.velomap.route;

public record RoutePoint(double lat, double lon) {
}
