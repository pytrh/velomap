// The only page of the app: a Leaflet map where the rider clicks a start and a
// destination, picks a bike profile, computes the route, sees it drawn with
// its distance, and downloads it as GPX.
// State lives in signals (reactive variables): when one changes, Angular
// re-renders the parts of the template that read it. The map itself is plain
// Leaflet, created in ngAfterViewInit because it needs the <div> to exist first.
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet';
import { BikeProfile, LatLon, RouteRequest, RouteResponse, RouteService } from './route.service';

const BORDEAUX: L.LatLngTuple = [44.8378, -0.5792];

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  private readonly routeService = inject(RouteService);
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('map');

  protected readonly profiles: { value: BikeProfile; label: string }[] = [
    { value: 'ROAD', label: 'Road' },
    { value: 'TRIATHLON', label: 'Triathlon' },
    { value: 'MOUNTAIN', label: 'Mountain' },
  ];

  protected readonly start = signal<LatLon | null>(null);
  protected readonly destination = signal<LatLon | null>(null);
  protected readonly profile = signal<BikeProfile>('ROAD');
  protected readonly route = signal<RouteResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly distanceKm = computed(() => {
    const route = this.route();
    return route ? (route.distanceMeters / 1000).toFixed(1) : null;
  });

  protected readonly hint = computed(() => {
    if (!this.start()) return 'Click the map to set the start.';
    if (!this.destination()) return 'Click the map to set the destination.';
    return 'Click the map again to start over.';
  });

  private map?: L.Map;
  // A layer group holds the markers and polyline so they can be cleared in one call.
  private readonly overlays = L.layerGroup();

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer().nativeElement).setView(BORDEAUX, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    this.overlays.addTo(this.map);
    this.map.on('click', (event: L.LeafletMouseEvent) => this.onMapClick(event.latlng));
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  protected onProfileChange(profile: string): void {
    this.profile.set(profile as BikeProfile);
    // A route drawn for another profile would no longer match the GPX download.
    this.clearRoute();
  }

  protected computeRoute(): void {
    const request = this.currentRequest();
    if (!request) return;
    this.loading.set(true);
    this.error.set(null);
    this.routeService.getRoute(request).subscribe({
      next: (route) => {
        this.loading.set(false);
        this.route.set(route);
        this.redraw();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }

  protected downloadGpx(): void {
    const request = this.currentRequest();
    if (!request) return;
    this.routeService.getGpx(request).subscribe({
      next: (blob) => {
        // Trigger a browser download of the in-memory file through a temporary link.
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `velomap-${request.profile.toLowerCase()}.gpx`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err: HttpErrorResponse) => this.error.set(errorMessage(err)),
    });
  }

  private onMapClick(latlng: L.LatLng): void {
    const point = { lat: latlng.lat, lon: latlng.lng };
    if (!this.start() || this.destination()) {
      this.start.set(point);
      this.destination.set(null);
    } else {
      this.destination.set(point);
    }
    this.clearRoute();
  }

  private clearRoute(): void {
    this.route.set(null);
    this.error.set(null);
    this.redraw();
  }

  // Redraw everything from the signals, so the map never drifts from the state.
  private redraw(): void {
    this.overlays.clearLayers();
    const start = this.start();
    const destination = this.destination();
    const route = this.route();
    if (route) {
      const line = L.polyline(
        route.points.map((p): L.LatLngTuple => [p.lat, p.lon]),
        { color: '#1d4ed8', weight: 5 },
      ).addTo(this.overlays);
      this.map?.fitBounds(line.getBounds(), { padding: [30, 30] });
    }
    // Circle markers avoid Leaflet's default marker images, which bundlers don't copy.
    if (start) marker(start, '#15803d').bindTooltip('Start').addTo(this.overlays);
    if (destination) marker(destination, '#b91c1c').bindTooltip('Destination').addTo(this.overlays);
  }

  private currentRequest(): RouteRequest | null {
    const from = this.start();
    const to = this.destination();
    return from && to ? { from, to, profile: this.profile() } : null;
  }
}

function marker(point: LatLon, color: string): L.CircleMarker {
  return L.circleMarker([point.lat, point.lon], { radius: 8, color, fillColor: color, fillOpacity: 0.9 });
}

function errorMessage(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Cannot reach the backend. Is it running on port 8080?';
  const message = (err.error as { message?: unknown } | null)?.message;
  return typeof message === 'string' ? message : `Request failed (HTTP ${err.status}).`;
}
