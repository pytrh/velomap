// The Leaflet map, as a React component. It shows OpenStreetMap tiles, reports
// clicks to the page through onMapClick, and draws whatever start, destination
// and route it is given. It holds no state of its own: the page owns the state
// and this component just mirrors it onto the map.
// "use client" = this code runs in the browser. Leaflet needs `window`, which
// doesn't exist on the server, so page.tsx also loads this file with ssr: false.
"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import type { LatLon, RouteResponse } from "@/lib/types";
import styles from "./page.module.css";

const BORDEAUX: L.LatLngTuple = [44.8378, -0.5792];

interface Props {
  start: LatLon | null;
  destination: LatLon | null;
  route: RouteResponse | null;
  onMapClick: (point: LatLon) => void;
}

export default function RouteMap({ start, destination, route, onMapClick }: Props) {
  // useRef keeps a value across re-renders without causing one: the <div>, the
  // Leaflet map, and a layer group holding markers and polyline (cleared in one call).
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const overlays = useRef<L.LayerGroup | null>(null);
  // Always call the latest onMapClick, without re-creating the map when it changes.
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  });

  // Runs once, after the <div> is on the page (React's ngAfterViewInit), and
  // removes the map when the component goes away (ngOnDestroy).
  useEffect(() => {
    const leafletMap = L.map(container.current!).setView(BORDEAUX, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);
    overlays.current = L.layerGroup().addTo(leafletMap);
    leafletMap.on("click", (event: L.LeafletMouseEvent) =>
      onMapClickRef.current({ lat: event.latlng.lat, lon: event.latlng.lng }),
    );
    map.current = leafletMap;
    return () => {
      leafletMap.remove();
    };
  }, []);

  // Redraw everything whenever the inputs change, so the map never drifts from the state.
  useEffect(() => {
    const layers = overlays.current;
    if (!layers) return;
    layers.clearLayers();
    if (route) {
      const line = L.polyline(
        route.points.map((p): L.LatLngTuple => [p.lat, p.lon]),
        { color: "#1d4ed8", weight: 5 },
      ).addTo(layers);
      map.current?.fitBounds(line.getBounds(), { padding: [30, 30] });
    }
    // Circle markers avoid Leaflet's default marker images, which bundlers don't copy.
    if (start) marker(start, "#15803d").bindTooltip("Start").addTo(layers);
    if (destination) marker(destination, "#b91c1c").bindTooltip("Destination").addTo(layers);
  }, [start, destination, route]);

  return (
    <div
      ref={container}
      className={styles.map}
      role="application"
      aria-label="Map: click to set start and destination"
    />
  );
}

function marker(point: LatLon, color: string): L.CircleMarker {
  return L.circleMarker([point.lat, point.lon], { radius: 8, color, fillColor: color, fillOpacity: 0.9 });
}
