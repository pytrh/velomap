# Velomap

Cycling route planner. A rider picks a start, a destination and a bike profile;
Velomap computes a route, shows it on a map, and exports it as GPX for a bike
computer.

Personal project. I'm new to Spring Boot, Angular and Next.js.

The repo holds the same app built twice: `spring-angular/` (Java + Angular) and
`nextjs/` (TypeScript throughout). Both must keep the same API contract and
behaviour; a change to one usually belongs in the other too.

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

**`spring-angular/`**

- Java 21, Spring Boot 3.x, Maven. groupId `fr.josephsong`, artifactId
  `velomap`, package `fr.josephsong.velomap`
- Angular 20+, standalone components, signals, `@if` / `@for`

**`nextjs/`**

- Next.js (App Router), TypeScript, React. Route Handlers under
  `src/app/api/` are the backend; no separate server framework
- `next.config.ts` loads the repo-root `.env`

**Both**

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

- `spring-angular/backend/` — Spring Boot
- `spring-angular/frontend/` — Angular
- `nextjs/` — Next.js (page and API)
- `.env` at the repo root, shared by both, gitignored

## Commands

- Spring backend: `cd spring-angular/backend && ./mvnw spring-boot:run` (port 8080)
- Angular frontend: `cd spring-angular/frontend && npm start` (port 4200)
- Next.js: `cd nextjs && npm run dev` (port 3000)

## Conventions

**Spring backend**

- Three layers: `@RestController` → `@Service` → the GraphHopper client.
- Constructor injection only, final fields, no `@Autowired`.
- DTOs as records. Keep the classes that mirror GraphHopper's JSON separate
  from the DTOs the controller returns.
- Use `RestClient` for the outbound HTTP call.
- CORS: allow `http://localhost:4200` on the controller so the Angular dev
  server can reach it.

**Angular frontend**

- HTTP in a service, never in a component.
- One page component is fine. Don't split into a component tree for this.
- Raw Leaflet via `npm install leaflet @types/leaflet`, initialised in
  `ngAfterViewInit`. No Angular wrapper library.

**Next.js**

- Same three layers as plain modules: route handler → `route-service.ts` →
  `graphhopper.ts`. Server-side modules import `"server-only"`.
- Types that mirror GraphHopper's JSON stay in `graphhopper.ts`, separate from
  our API types in `types.ts`.
- Browser HTTP in `route-client.ts`, never in a component.
- One page component plus the map component. Raw Leaflet in `useEffect`,
  loaded with `dynamic(..., { ssr: false })`. No react-leaflet.

## Explaining the code

Put a short comment at the top of every file saying what it does and why it
exists, written for someone who has never used Spring, Angular, React or Next.js. No commentary
in chat, comments in the files only.

`NOTES.md` at the repo root holds the shared API contract and the decisions
worth defending in an interview (why a GET, why DTOs separate from the
GraphHopper response, why the profiles are incomplete). Each implementation has
its own `NOTES.md`: one page, plain language, covering how a request flows from
the browser to GraphHopper and back and what each file is for.
