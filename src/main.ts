import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Punto de arranque de la aplicación Angular.
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
