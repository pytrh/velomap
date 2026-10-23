// Turns a computed route into GPX, the XML format bike computers (Garmin,
// Wahoo, ...) import as a course. Just a <trk> with one point per <trkpt>.
// A pure function with no Next.js involvement; same output as GpxWriter.java.
import type { RouteResponse } from "./types";

export function toGpx(route: RouteResponse, name: string): string {
  const trackPoints = route.points
    .map((p) => `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lon.toFixed(6)}"/>\n`)
    .join("");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<gpx version="1.1" creator="Velomap" xmlns="http://www.topografix.com/GPX/1/1">\n` +
    `  <metadata><name>${name}</name></metadata>\n` +
    `  <trk>\n` +
    `    <name>${name}</name>\n` +
    `    <trkseg>\n` +
    trackPoints +
    `    </trkseg>\n` +
    `  </trk>\n` +
    `</gpx>\n`
  );
}
