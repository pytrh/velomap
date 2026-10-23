// The only class that talks to GraphHopper over HTTP. It builds the request URL
// (including the API key) and turns the JSON reply into GraphHopperRouteResponse.
// Isolating it here means the service above never deals with URLs or keys.
// @Component makes Spring create one instance and hand it to whoever needs it.
package fr.josephsong.velomap.graphhopper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class GraphHopperClient {

	private final RestClient restClient;
	private final String apiKey;

	// Spring calls this constructor and supplies the arguments: a RestClient
	// builder it pre-configures (JSON support), and values from application.properties.
	public GraphHopperClient(RestClient.Builder restClientBuilder,
			@Value("${graphhopper.base-url}") String baseUrl,
			@Value("${graphhopper.api-key}") String apiKey) {
		this.restClient = restClientBuilder.baseUrl(baseUrl).build();
		this.apiKey = apiKey;
	}

	// Throws RestClientResponseException if GraphHopper answers with an error status.
	public GraphHopperRouteResponse route(double fromLat, double fromLon, double toLat, double toLon,
			String vehicleProfile) {
		return restClient.get()
			.uri(uriBuilder -> uriBuilder.path("/route")
				.queryParam("point", fromLat + "," + fromLon)
				.queryParam("point", toLat + "," + toLon)
				.queryParam("profile", vehicleProfile)
				.queryParam("points_encoded", false) // plain [lon, lat] arrays instead of a compressed string
				.queryParam("instructions", false) // we don't show turn-by-turn directions
				.queryParam("key", apiKey)
				.build())
			.retrieve()
			.body(GraphHopperRouteResponse.class);
	}

}
