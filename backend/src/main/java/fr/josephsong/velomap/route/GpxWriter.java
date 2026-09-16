// Turns a computed route into GPX, the XML format bike computers (Garmin,
// Wahoo, ...) import as a course. Just a <trk> with one point per <trkpt>.
// Pure function with no Spring involvement, so it's a plain static utility.
package fr.josephsong.velomap.route;

import java.util.Locale;

final class GpxWriter {

	private GpxWriter() {
	}

	static String write(RouteResponse route, String name) {
		StringBuilder gpx = new StringBuilder();
		gpx.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
		gpx.append("<gpx version=\"1.1\" creator=\"Velomap\" xmlns=\"http://www.topografix.com/GPX/1/1\">\n");
		gpx.append("  <metadata><name>").append(name).append("</name></metadata>\n");
		gpx.append("  <trk>\n");
		gpx.append("    <name>").append(name).append("</name>\n");
		gpx.append("    <trkseg>\n");
		for (RoutePoint point : route.points()) {
			// Locale.ROOT guarantees a "." decimal separator whatever the machine's language.
			gpx.append(String.format(Locale.ROOT, "      <trkpt lat=\"%.6f\" lon=\"%.6f\"/>%n", point.lat(),
					point.lon()));
		}
		gpx.append("    </trkseg>\n");
		gpx.append("  </trk>\n");
		gpx.append("</gpx>\n");
		return gpx.toString();
	}

}
