// The HTTP entry point. Maps GET /api/route and GET /api/route/gpx to methods,
// reads the query parameters, delegates to RouteService, and shapes the HTTP
// response (JSON body, or a downloadable .gpx file).
// @RestController = return values are written straight into the response body.
// @CrossOrigin lets the Angular dev server (a different port = different
// "origin") call this API from the browser.
package fr.josephsong.velomap.route;

import fr.josephsong.velomap.graphhopper.GraphHopperError;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;

@RestController
@RequestMapping("/api/route")
@CrossOrigin(origins = "http://localhost:4200")
public class RouteController {

	private final RouteService routeService;

	public RouteController(RouteService routeService) {
		this.routeService = routeService;
	}

	@GetMapping
	public RouteResponse route(@RequestParam double fromLat, @RequestParam double fromLon,
			@RequestParam double toLat, @RequestParam double toLon, @RequestParam BikeProfile profile) {
		return routeService.computeRoute(fromLat, fromLon, toLat, toLon, profile);
	}

	@GetMapping("/gpx")
	public ResponseEntity<String> gpx(@RequestParam double fromLat, @RequestParam double fromLon,
			@RequestParam double toLat, @RequestParam double toLon, @RequestParam BikeProfile profile) {
		String gpx = routeService.computeGpx(fromLat, fromLon, toLat, toLon, profile);
		// Content-Disposition: attachment makes the browser save the file instead of displaying it.
		return ResponseEntity.ok()
			.contentType(MediaType.parseMediaType("application/gpx+xml"))
			.header(HttpHeaders.CONTENT_DISPOSITION,
					ContentDisposition.attachment().filename("velomap-route.gpx").build().toString())
			.body(gpx);
	}

	// When GraphHopper refuses a request (bad key, unsupported profile, point off
	// the map...), pass its message on as 502 Bad Gateway instead of a bare 500,
	// so the page can show the rider what went wrong.
	@ExceptionHandler(RestClientResponseException.class)
	public ResponseEntity<GraphHopperError> graphHopperRejected(RestClientResponseException exception) {
		GraphHopperError error = exception.getResponseBodyAs(GraphHopperError.class);
		String message = error != null && error.message() != null ? error.message()
				: "GraphHopper returned HTTP " + exception.getStatusCode().value();
		return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new GraphHopperError(message));
	}

}
