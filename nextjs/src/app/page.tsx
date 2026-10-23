// The only page of the app (served at "/"): the rider clicks a start and a
// destination on the map, picks a bike profile, computes the route, sees its
// distance, and downloads it as GPX.
// State lives in useState hooks: calling a setter re-renders the component with
// the new value (React's equivalent of Angular signals). Network calls go
// through route-client.ts, never from here directly.
// "use client" = this component runs in the browser, because it reacts to clicks.
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { getGpx, getRoute } from "@/lib/route-client";
import { BIKE_PROFILES, type BikeProfile, type LatLon, type RouteRequest, type RouteResponse } from "@/lib/types";
import styles from "./page.module.css";

// Load the map only in the browser: Leaflet touches `window` as soon as it is imported.
const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

const PROFILE_LABELS: Record<BikeProfile, string> = {
  ROAD: "Road",
  TRIATHLON: "Triathlon",
  MOUNTAIN: "Mountain",
};

export default function Home() {
  const [start, setStart] = useState<LatLon | null>(null);
  const [destination, setDestination] = useState<LatLon | null>(null);
  const [profile, setProfile] = useState<BikeProfile>("ROAD");
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request: RouteRequest | null = start && destination ? { from: start, to: destination, profile } : null;

  const hint = !start
    ? "Click the map to set the start."
    : !destination
      ? "Click the map to set the destination."
      : "Click the map again to start over.";

  function clearRoute() {
    setRoute(null);
    setError(null);
  }

  function onMapClick(point: LatLon) {
    if (!start || destination) {
      setStart(point);
      setDestination(null);
    } else {
      setDestination(point);
    }
    clearRoute();
  }

  function onProfileChange(value: BikeProfile) {
    setProfile(value);
    // A route drawn for another profile would no longer match the GPX download.
    clearRoute();
  }

  async function computeRoute() {
    if (!request) return;
    setLoading(true);
    setError(null);
    try {
      setRoute(await getRoute(request));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function downloadGpx() {
    if (!request) return;
    try {
      const blob = await getGpx(request);
      // Trigger a browser download of the in-memory file through a temporary link.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `velomap-${request.profile.toLowerCase()}.gpx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-label="Route planner">
        <h1>Velomap</h1>
        <p className={styles.hint}>{hint}</p>

        <label htmlFor="profile">Bike profile</label>
        <select id="profile" value={profile} onChange={(e) => onProfileChange(e.target.value as BikeProfile)}>
          {BIKE_PROFILES.map((value) => (
            <option key={value} value={value}>
              {PROFILE_LABELS[value]}
            </option>
          ))}
        </select>

        <button type="button" onClick={computeRoute} disabled={!request || loading}>
          {loading ? "Computing…" : "Compute route"}
        </button>

        <div aria-live="polite">
          {route && (
            <>
              <p className={styles.distance}>
                Distance: <strong>{(route.distanceMeters / 1000).toFixed(1)} km</strong>
              </p>
              <button type="button" onClick={downloadGpx}>
                Download GPX
              </button>
            </>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      <RouteMap start={start} destination={destination} route={route} onMapClick={onMapClick} />
    </main>
  );
}

function errorMessage(err: unknown): string {
  // fetch throws a TypeError when the server can't be reached at all.
  if (err instanceof TypeError) return "Cannot reach the server. Is `npm run dev` running?";
  return err instanceof Error ? err.message : String(err);
}
