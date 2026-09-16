# Velomap — how it works

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

**Backend** (`backend/src/main/java/fr/josephsong/velomap/`)

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

**Frontend** (`frontend/src/`)

| File | Role |
|---|---|
| `main.ts`, `index.html` | Boot Angular into the page |
| `app/app.config.ts` | Registers `HttpClient` |
| `app/route.service.ts` | All HTTP calls, plus the TypeScript types of the API |
| `app/app.ts`, `app.html`, `app.css` | The single page: map, dropdown, buttons, state |
| `angular.json` | Build config; pulls in Leaflet's CSS |

## Decisions worth defending

**Why GET.** Computing a route reads data and changes nothing on the server, and
the same inputs always give the same route. That is exactly what GET means. It
also makes the URL shareable, cacheable and testable with plain `curl`, and lets
the GPX endpoint work as a simple download link. Five numbers and an enum fit
comfortably in a query string, so a request body isn't needed.

**Why DTOs separate from GraphHopper's response.** GraphHopper's JSON is their
contract; `RouteResponse` is ours with the frontend. Keeping them apart means:
the frontend gets exactly what it needs (points as `lat, lon`, seconds rather
than milliseconds, no bbox, weight, ascend…); a change on GraphHopper's side,
or swapping to another routing engine, is absorbed in the `graphhopper`
package without touching the Angular code; and the conversion (swapping the
coordinate order, the unit change) happens in one place instead of
leaking into the UI.

**Why the profiles are incomplete.** A real road vs. triathlon vs. MTB
distinction needs GraphHopper *custom models* (penalising surfaces, turns,
gradients), which the free hosted tier doesn't allow. So `ROAD` and `TRIATHLON`
both use `bike` and produce identical routes. Faking a difference would mislead
the rider. The intended rules are written as a TODO in `RouteService`. On
top of that, this account's key only allows `car`, `bike` and `foot`, so
`MOUNTAIN` (`mtb`) is rejected by GraphHopper, and the page shows that message
rather than silently routing as a normal bike.
