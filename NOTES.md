# Velomap: notes

This repo holds the same app built twice, in two stacks. Each one has its
own NOTES.md for its request flow and what each file does:

- [`spring-angular/NOTES.md`](spring-angular/NOTES.md): Java + Spring Boot API, Angular page
- [`nextjs/NOTES.md`](nextjs/NOTES.md): TypeScript throughout, with Next.js

Both expose the same API, so either frontend could talk to either backend:

```
GET /api/route?fromLat=…&fromLon=…&toLat=…&toLon=…&profile=ROAD|TRIATHLON|MOUNTAIN
  → 200 {"points":[{"lat":…,"lon":…},…],"distanceMeters":…,"durationSeconds":…}
  → 400 on a missing or bad parameter
  → 502 {"message":"…"} when GraphHopper refuses the request
GET /api/route/gpx?<same parameters>
  → 200 application/gpx+xml, downloaded as velomap-route.gpx
```

## Decisions worth defending

**Why GET.** Computing a route reads data and changes nothing on the server, and
the same inputs always give the same route. That is exactly what GET means. It
also makes the URL shareable, cacheable and testable with plain `curl`, and lets
the GPX endpoint work as a simple download link. Five numbers and an enum fit
comfortably in a query string, so a request body isn't needed.

**Why DTOs separate from GraphHopper's response.** GraphHopper's JSON is their
contract; our route response is ours with the frontend. Keeping them apart means:
the frontend gets exactly what it needs (points as `lat, lon`, seconds rather
than milliseconds, no bbox, weight, ascend…); a change on GraphHopper's side,
or swapping to another routing engine, is absorbed in the GraphHopper client
code without touching the page; and the conversion (swapping the coordinate
order, the unit change) happens in one place instead of leaking into the UI.

**Why the profiles are incomplete.** A real road vs. triathlon vs. MTB
distinction needs GraphHopper *custom models* (penalising surfaces, turns,
gradients), which the free hosted tier doesn't allow. So `ROAD` and `TRIATHLON`
both use `bike` and produce identical routes. Faking a difference would mislead
the rider. The intended rules are written as a TODO in each route service. On
top of that, this account's key only allows `car`, `bike` and `foot`, so
`MOUNTAIN` (`mtb`) is rejected by GraphHopper, and the page shows that message
rather than silently routing as a normal bike.

**Why two implementations in one repo.** It's one product, so one repo, one
README and one `.env`. Each folder is a self-contained app with its own
dependencies and run command; nothing is shared between them at build time,
which keeps them easy to compare and impossible to break each other.
