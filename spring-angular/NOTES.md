# Velomap (Spring Boot + Angular): how it works

The shared decisions (why GET, why separate DTOs, why the profiles are
incomplete) are in the root [`NOTES.md`](../NOTES.md).

## A request, end to end

1. **Browser (Angular).** The rider clicks the map twice. `app.ts` stores the two
   points in signals and draws markers with Leaflet. Clicking *Compute route*
   calls `RouteService.getRoute()`, which sends
   `GET http://localhost:8080/api/route?fromLat=…&fromLon=…&toLat=…&toLon=…&profile=ROAD`.
2. **Controller (Spring).** `RouteController` matches the URL, converts the
   query parameters to `double`s and to the `BikeProfile` enum (a bad profile
   is a 400 before any of our code runs), and calls `RouteService`.
3. **Service.** `RouteService` maps the bike profile to a GraphHopper profile
   (`ROAD`/`TRIATHLON` → `bike`, `MOUNTAIN` → `mtb`) and calls `GraphHopperClient`.
4. **Client.** `GraphHopperClient` uses `RestClient` to call
   `https://graphhopper.com/api/1/route` with the two points, the profile,
   `points_encoded=false` and the API key. Jackson turns the JSON reply into
   `GraphHopperRouteResponse`.
5. **Back up.** The service takes the first path, swaps each `[lon, lat]` pair
   into a `RoutePoint(lat, lon)`, converts milliseconds to seconds, and returns
   a `RouteResponse`. Spring serialises it to JSON; Angular draws the points as a
   polyline and shows the distance.
6. **GPX.** *Download GPX* calls `/api/route/gpx` with the same parameters. The
   service computes the same route and `GpxWriter` turns it into a GPX 1.1
   track, sent with `Content-Disposition: attachment`. The page saves the bytes
   as a file.

If GraphHopper refuses a request, the controller's `@ExceptionHandler` returns
502 with GraphHopper's own message, and the page displays it.

## What each file is for

**Backend** (`spring-angular/backend/src/main/java/fr/josephsong/velomap/`)

| File | Role |
|---|---|
| `VelomapApplication.java` | Starts Spring and the embedded web server |
| `route/RouteController.java` | HTTP layer: URLs, parameters, JSON / file responses, error mapping |
| `route/RouteService.java` | Logic: profile mapping, calling the client, converting to DTOs and GPX |
| `route/BikeProfile.java` | The three bike types the API accepts |
| `route/RouteResponse.java`, `route/RoutePoint.java` | DTOs: what the frontend receives |
| `route/GpxWriter.java` | Builds the GPX XML |
| `graphhopper/GraphHopperClient.java` | The only code that calls GraphHopper |
| `graphhopper/GraphHopperRouteResponse.java`, `GraphHopperError.java` | Mirrors of GraphHopper's JSON |
| `resources/application.properties` | Config: port, GraphHopper URL, API key from the environment / `.env` |

**Frontend** (`spring-angular/frontend/src/`)

| File | Role |
|---|---|
| `main.ts`, `index.html` | Boot Angular into the page |
| `app/app.config.ts` | Registers `HttpClient` |
| `app/route.service.ts` | All HTTP calls, plus the TypeScript types of the API |
| `app/app.ts`, `app.html`, `app.css` | The single page: map, dropdown, buttons, state |
| `angular.json` | Build config; pulls in Leaflet's CSS |
