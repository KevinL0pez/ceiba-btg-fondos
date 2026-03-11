import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouter } from '@angular/router';
import { DefaultInterceptor } from '@core/interceptor/default.interceptor';
import { environment } from '@env/environment';
import { routes } from './app.routes';
import { SuscripcionesEffects } from './store/effects/suscripciones.effects';
import { SUSCRIPCIONES_FEATURE_KEY, suscripcionesReducer } from './store/reducers/suscripciones.reducer';

/**
 * Configuración principal de providers de Angular.
 * Registra router, cliente HTTP, interceptor global y estado NgRx.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideStore({
      [SUSCRIPCIONES_FEATURE_KEY]: suscripcionesReducer,
    }),
    provideEffects([SuscripcionesEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DefaultInterceptor,
      multi: true,
    },
  ],
};
