// Mirror of the JSON that GraphHopper's /route endpoint sends back, reduced to
// the fields we read. Jackson (Spring's JSON library) fills these records from
// the response and ignores every field not listed here.
// Kept separate from our own DTOs so a change on GraphHopper's side only
// touches this package, never the API the Angular app depends on.
package fr.josephsong.velomap.graphhopper;

import java.util.List;

public record GraphHopperRouteResponse(List<Path> paths) {

	// One candidate route. distance is in metres, time in milliseconds.
	public record Path(double distance, long time, Points points) {
	}

	// GeoJSON LineString: each coordinate is [longitude, latitude] (note the order).
	// Only returned in this shape because we ask for points_encoded=false.
	public record Points(String type, List<List<Double>> coordinates) {
	}

}
