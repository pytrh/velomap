// All HTTP calls to the Velomap backend live here, so components never build
// URLs or talk to the network themselves. providedIn: 'root' means Angular
// creates a single shared instance that any component can ask for with inject().
// Also declares the TypeScript shapes of the backend's JSON.
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type BikeProfile = 'ROAD' | 'TRIATHLON' | 'MOUNTAIN';

export interface LatLon {
  lat: number;
  lon: number;
}

// Mirrors RouteResponse.java on the backend.
export interface RouteResponse {
  points: LatLon[];
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteRequest {
  from: LatLon;
  to: LatLon;
  profile: BikeProfile;
}

const API_URL = 'http://localhost:8080/api/route';

@Injectable({ providedIn: 'root' })
export class RouteService {
  private readonly http = inject(HttpClient);

  // Observables are lazy: the request is only sent when the caller subscribes.
  getRoute(request: RouteRequest): Observable<RouteResponse> {
    return this.http.get<RouteResponse>(API_URL, { params: toParams(request) });
  }

  // The .gpx file comes back as raw bytes (a Blob) for the page to save.
  getGpx(request: RouteRequest): Observable<Blob> {
    return this.http.get(`${API_URL}/gpx`, { params: toParams(request), responseType: 'blob' });
  }
}

function toParams({ from, to, profile }: RouteRequest): HttpParams {
  return new HttpParams({
    fromObject: {
      fromLat: from.lat,
      fromLon: from.lon,
      toLat: to.lat,
      toLon: to.lon,
      profile,
    },
  });
}
