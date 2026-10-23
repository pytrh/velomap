// Browser entry point: starts Angular by rendering the App component into the
// <app-root> tag of index.html, using the setup in app.config.ts.
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
