# Velomap

Cycling route planner: pick a start and destination on a map, choose a bike
profile, get a route and export it as GPX for a bike computer. Routing by the
hosted [GraphHopper Routing API](https://docs.graphhopper.com/).

The same app is built twice, in two stacks:

| Folder | Stack | URL |
|---|---|---|
| [`spring-angular/`](spring-angular/) | Java 21 + Spring Boot API, Angular page | http://localhost:4200 (API on :8080) |
| [`nextjs/`](nextjs/) | TypeScript throughout: Next.js serves both the page and the API | http://localhost:3000 |

They share the API contract and one `.env` file. See `NOTES.md` for how they work.

## Setup

1. Get a GraphHopper API key (free at https://graphhopper.com/dashboard) and put
   it in a `.env` file at the repo root (it is gitignored, never commit it):

   ```
   GRAPHHOPPER_API_KEY=your-key-here
   ```

   Both implementations read it automatically. A `GRAPHHOPPER_API_KEY`
   environment variable, if set, takes precedence.

2. Install what the implementation you want needs:
   - Spring + Angular: Java 21 (the project ships `./mvnw`), Node.js 20+, then
     `cd spring-angular/frontend && npm install`
   - Next.js: Node.js 20+, then `cd nextjs && npm install`

## Run

**Spring + Angular**, in two terminals from the repo root:

```
cd spring-angular/backend && ./mvnw spring-boot:run     # API on http://localhost:8080
cd spring-angular/frontend && npm start                 # app on http://localhost:4200
```

**Next.js**, one terminal:

```
cd nextjs && npm run dev                                # app and API on http://localhost:3000
```

## API (same in both)

```
GET /api/route?fromLat=44.8378&fromLon=-0.5792&toLat=44.8600&toLon=-0.5500&profile=ROAD
GET /api/route/gpx?<same parameters>
```

`profile` is `ROAD`, `TRIATHLON` or `MOUNTAIN`.
