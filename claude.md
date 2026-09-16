# Velomap

Cycling route planner. A rider picks a start, a destination and a bike profile;
Velomap computes a route, shows it on a map, and exports it as GPX for a bike
computer.

Personal project. I'm new to Spring Boot and Angular.

## Build this tonight, nothing more

One working vertical slice. No database, no auth, no tests beyond a smoke test,
no error handling beyond what's needed to not crash. If something isn't on this
list, don't build it.

1. Backend endpoint: `GET /api/route` taking `fromLat`, `fromLon`, `toLat`,
   `toLon`, `profile`. Calls the hosted GraphHopper Routing API, returns a DTO
   with the route points, distance in metres and duration in seconds.
2. Backend endpoint: `GET /api/route/gpx` with the same parameters, returning a
   .gpx file as a download.
3. Angular page: a Leaflet map, click to set start then destination, a dropdown
   for the bike profile, a button to compute, the route drawn as a polyline,
   distance shown, and a download button for the GPX.

## Stack

- Java 21, Spring Boot 3.x, Maven. groupId `fr.josephsong`, artifactId
  `velomap`, package `fr.josephsong.velomap`
- Angular 20+, standalone components, signals, `@if` / `@for`
- Leaflet with OpenStreetMap tiles
- Routing: hosted GraphHopper Routing API, key read from the
  `GRAPHHOPPER_API_KEY` environment variable. Never hardcode it, never commit
  it.

## Bike profiles

Three values: `ROAD`, `TRIATHLON`, `MOUNTAIN`. Map `ROAD` and `TRIATHLON` to
GraphHopper's `bike`, `MOUNTAIN` to `mtb`, in one small switch in the service.

`ROAD` and `TRIATHLON` are therefore identical tonight. That is a known
limitation, not an oversight: differentiating them needs GraphHopper custom
models, which the free hosted tier doesn't allow. Do not fake a difference.

Put this in the service as a TODO, in these words:

  TODO custom models (needs self-hosted GraphHopper or a paid plan):
  ROAD      — avoid cobbles and rough surfaces, tolerate steep gradients and
              twisty roads
  TRIATHLON — as ROAD, plus penalise turns and junction density (aero position
              handles badly) and cap gradient harder (hard to climb out of the
              saddle on aerobars)
  MOUNTAIN  — no surface penalty, prefer tracks and paths

## Layout

- `backend/` — Spring Boot
- `frontend/` — Angular

## Commands

- Backend: `cd backend && ./mvnw spring-boot:run` (port 8080)
- Frontend: `cd frontend && npm start` (port 4200)

## Conventions

**Backend**

- Three layers: `@RestController` → `@Service` → the GraphHopper client.
- Constructor injection only, final fields, no `@Autowired`.
- DTOs as records. Keep the classes that mirror GraphHopper's JSON separate
  from the DTOs the controller returns.
- Use `RestClient` for the outbound HTTP call.
- CORS: allow `http://localhost:4200` on the controller so the Angular dev
  server can reach it.

**Frontend**

- HTTP in a service, never in a component.
- One page component is fine. Don't split into a component tree for this.
- Raw Leaflet via `npm install leaflet @types/leaflet`, initialised in
  `ngAfterViewInit`. No Angular wrapper library.

## Explaining the code

Put a short comment at the top of every file saying what it does and why it
exists, written for someone who has never used Spring or Angular. No commentary
in chat, comments in the files only.

Also write `NOTES.md` at the repo root: one page, plain language, covering how
a request flows from the browser to GraphHopper and back, what each file is
for, and the two or three decisions worth defending in an interview (why a GET,
why DTOs separate from the GraphHopper response, why the profiles are
incomplete).
