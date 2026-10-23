// App-wide setup, read once when the app starts (see main.ts). "Providers"
// register services Angular can inject; provideHttpClient() makes HttpClient
// available to RouteService.
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
};
