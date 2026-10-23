# Velomap (Next.js): how it works

The same app as `spring-angular/`, written in TypeScript from end to end with
Next.js. The API contract and the decisions behind it are in the root
[`NOTES.md`](../NOTES.md).

Next.js is a framework built on React. It serves the page (the frontend) and
runs **Route Handlers**, server functions for URLs under `src/app/api/` (the
backend), from a single process on port 3000. No other framework is needed.

## A request, end to end

1. **Browser (React).** The rider clicks the map twice. `page.tsx` stores the
   two points with `useState`, and `RouteMap.tsx` draws them with Leaflet.
   Clicking *Compute route* calls `getRoute()` in `route-client.ts`, which sends
   `GET /api/route?fromLat=…&fromLon=…&toLat=…&toLon=…&profile=ROAD` to the
   same server that served the page.
2. **Route handler.** Next.js finds `src/app/api/route/route.ts` because its
   folder path matches the URL, and calls its `GET` function.
   `parseRouteRequest` checks the parameters (400 if one is missing or the
   profile is unknown), then the handler calls `computeRoute`.
3. **Service.** `route-service.ts` maps the bike profile to a GraphHopper
   profile (`ROAD`/`TRIATHLON` → `bike`, `MOUNTAIN` → `mtb`) and calls
   `fetchRoute` in `graphhopper.ts`.
4. **Client.** `graphhopper.ts` calls `https://graphhopper.com/api/1/route` with
   `fetch`, passing the two points, the profile, `points_encoded=false` and the
   API key read from the environment.
5. **Back up.** The service takes the first path, turns each `[lon, lat]` pair
   into `{lat, lon}`, converts milliseconds to seconds, and returns a
   `RouteResponse`. The handler sends it as JSON, and the page draws it as a
   polyline and shows the distance.
6. **GPX.** *Download GPX* calls `/api/route/gpx`, which computes the same
   route, turns it into GPX 1.1 with `toGpx`, and sends it with
   `Content-Disposition: attachment`. The page saves the bytes as a file.

If GraphHopper refuses a request, `graphHopperRejected` answers 502 with
GraphHopper's own message, and the page shows it.

## What each file is for (`nextjs/`)

| File | Role | Spring/Angular counterpart |
|---|---|---|
| `src/app/api/route/route.ts` | `GET /api/route` | `RouteController#route` |
| `src/app/api/route/gpx/route.ts` | `GET /api/route/gpx` | `RouteController#gpx` |
| `src/lib/route-params.ts` | Parameter checks (400) and GraphHopper errors (502) | Spring's `@RequestParam` conversion and `@ExceptionHandler` |
| `src/lib/route-service.ts` | Profile mapping, conversion to our types and GPX | `RouteService`, `BikeProfile` |
| `src/lib/graphhopper.ts` | The only code that calls GraphHopper; mirrors its JSON | `GraphHopperClient`, `GraphHopperRouteResponse`, `GraphHopperError` |
| `src/lib/gpx.ts` | Builds the GPX XML | `GpxWriter` |
| `src/lib/types.ts` | Our API's types, used by both server and browser | `RouteResponse`, `RoutePoint` and the interfaces in Angular's `route.service.ts` |
| `src/lib/route-client.ts` | Browser-side calls to our API | Angular `route.service.ts` |
| `src/app/page.tsx` | The page: state, dropdown, buttons, distance, errors | `app.ts`, `app.html` |
| `src/app/RouteMap.tsx` | The Leaflet map | the Leaflet part of `app.ts` |
| `src/app/page.module.css`, `globals.css` | Styles | `app.css`, `styles.css` |
| `src/app/layout.tsx` | `<html>`/`<body>` wrapper, loads Leaflet's CSS | `index.html`, `angular.json` styles |
| `next.config.ts` | Loads the repo-root `.env` | `application.properties` |

## What's different from the Spring version

- **One server, one origin.** The page and the API come from the same server
  on port 3000, so the browser uses relative URLs and there is no CORS setup.
- **Types written once.** `types.ts` is imported by both sides, so the server
  and the page can't drift apart. In the Spring version, the Java records and
  the Angular interfaces must be kept in sync by hand.
- **Server code vs. browser code.** Files marked `"use client"` run in the
  browser. Everything else under `src/lib` that imports `"server-only"` can
  only run on the server, and the build fails if the page imports it, so the
  API key can't end up in the browser.
- **We write what Spring gave us for free.** Parameter checking and the 502
  error mapping are a few lines of our own code (`route-params.ts`) rather than
  annotations.
- **Leaflet is loaded in the browser only** (`dynamic(..., { ssr: false })`),
  because Next.js also renders pages on the server, where Leaflet can't run.
