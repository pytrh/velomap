// The business logic: picks the GraphHopper profile for the chosen bike, asks
// the client for a route, and converts GraphHopper's answer into our own DTO
// (and into GPX for the download). Controllers stay thin; the logic lives here.
// @Service makes Spring create one instance and inject it into the controller.
package fr.josephsong.velomap.route;

import fr.josephsong.velomap.graphhopper.GraphHopperClient;
import fr.josephsong.velomap.graphhopper.GraphHopperRouteResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

	private final GraphHopperClient graphHopperClient;

	public RouteService(GraphHopperClient graphHopperClient) {
		this.graphHopperClient = graphHopperClient;
	}

	public RouteResponse computeRoute(double fromLat, double fromLon, double toLat, double toLon,
			BikeProfile profile) {
		GraphHopperRouteResponse response = graphHopperClient.route(fromLat, fromLon, toLat, toLon,
				toGraphHopperProfile(profile));
		// GraphHopper can return alternatives; the first path is the best one.
		GraphHopperRouteResponse.Path path = response.paths().getFirst();
		List<RoutePoint> points = path.points()
			.coordinates()
			.stream()
			.map(coordinate -> new RoutePoint(coordinate.get(1), coordinate.get(0))) // [lon, lat] -> (lat, lon)
			.toList();
		return new RouteResponse(points, path.distance(), path.time() / 1000);
	}

	public String computeGpx(double fromLat, double fromLon, double toLat, double toLon, BikeProfile profile) {
		RouteResponse route = computeRoute(fromLat, fromLon, toLat, toLon, profile);
		return GpxWriter.write(route, "Velomap " + profile.name().toLowerCase() + " route");
	}

	// TODO custom models (needs self-hosted GraphHopper or a paid plan):
	// ROAD      — avoid cobbles and rough surfaces, tolerate steep gradients and
	//             twisty roads
	// TRIATHLON — as ROAD, plus penalise turns and junction density (aero position
	//             handles badly) and cap gradient harder (hard to climb out of the
	//             saddle on aerobars)
	// MOUNTAIN  — no surface penalty, prefer tracks and paths
	private static String toGraphHopperProfile(BikeProfile profile) {
		return switch (profile) {
			case ROAD, TRIATHLON -> "bike";
			case MOUNTAIN -> "mtb";
		};
	}

}
