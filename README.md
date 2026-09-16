# Velomap

Cycling route planner: pick a start and destination on a map, choose a bike
profile, get a route and export it as GPX for a bike computer.

Spring Boot backend (`backend/`) + Angular frontend (`frontend/`), routing by the
hosted [GraphHopper Routing API](https://docs.graphhopper.com/).

## Requirements

- Java 21 (Maven is not needed; the project ships `./mvnw`)
- Node.js 20+ and npm
- A GraphHopper API key (free at https://graphhopper.com/dashboard)

## Setup

1. Create a `.env` file at the repo root (it is gitignored, never commit it):

   ```
   GRAPHHOPPER_API_KEY=your-key-here
   ```

   The backend reads it automatically. A `GRAPHHOPPER_API_KEY` environment
   variable, if set, takes precedence.

2. Install frontend dependencies once:

   ```
   cd frontend && npm install
   ```

## Run

In two terminals, from the repo root:

```
cd backend && ./mvnw spring-boot:run     # API on http://localhost:8080
cd frontend && npm start                 # app on http://localhost:4200
```

Open http://localhost:4200.

## API

```
GET /api/route?fromLat=44.8378&fromLon=-0.5792&toLat=44.8600&toLon=-0.5500&profile=ROAD
GET /api/route/gpx?<same parameters>
```

`profile` is `ROAD`, `TRIATHLON` or `MOUNTAIN`. See `NOTES.md` for how it works.
